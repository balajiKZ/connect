import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

const SERVICE = 'fe84';
const NOTIFY_CHARACTERISTIC = '2d30c082-f39f-4ce6-923f-3484ea480596';
const WRITE_CHARACTERISTIC = '2d30c083-f39f-4ce6-923f-3484ea480596';

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  peripheral: any = {};
  statusMessage: string;
  connected: boolean = false;
  device: any;
  public selection: string = "onOff";

  private cartridge1: boolean = false;
  private cartridge2: boolean = false;
  private cartridge3: boolean = false;
  private cartridge4: boolean = false;
  private blower1: boolean = false;
  private blower2: boolean = false;

  public cart1Name: string = "cartridge 1";
  public cart2Name: string = "cartridge 2";
  public cart3Name: string = "cartridge 3";
  public cart4Name: string = "cartridge 4";

  private timer = [
    {
      label: 'Cartridge 1',
      bodyLabel: 'cart1Tim',
      onTime: 10,
      offTime: 50,
      status: false
    },
    {
      label: 'Cartridge 2',
      bodyLabel: 'cart2Tim',
      onTime: 10,
      offTime: 50,
      status: false
    },
    {
      label: 'Cartridge 3',
      bodyLabel: 'cart3Tim',
      onTime: 10,
      offTime: 50,
      status: false
    },
    {
      label: 'Cartridge 4',
      bodyLabel: 'cart4Tim',
      onTime: 10,
      offTime: 50,
      status: false
    }
  ];

  simpleColumns = [
    {
      name: 'col1',
      options: [
      ]
    }
  ];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private ble: BLE,
    private toastCtrl: ToastController,
    private ngZone: NgZone) {

    this.device = navParams.get('device');
    this.device.name = this.device.name.substring(0, 11);
    this.device.name = this.device.name.replace("_", " ");
    this.setStatus('Connecting to ' + this.device.name || this.device.id);

    this.ble.connect(this.device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      peripheral => this.onDeviceDisconnected(peripheral)
    );

    setTimeout(() => {
      if (!this.connected) {
        let toast = this.toastCtrl.create({
          message: 'Please turn ON the bluetooth and restart the application',
          duration: 3000,
          position: 'middle'
        });
        toast.present();
      }
    }, 5000);
    for (var i = 0; i < 101; i++) {
      this.simpleColumns[0].options.push({ text: i.toString(), value: i.toString() });
    }

  }

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('');
      this.peripheral = peripheral;
    });

    this.connected = true;

    this.statusMessage = "Connected";
    console.log(peripheral.id);

    this.ble.read(this.peripheral.id, SERVICE, NOTIFY_CHARACTERISTIC).then(
      buffer => {
        let data = new Uint32Array(buffer);
        this.updateUI(data[0]);
      }
    );
  }

  onDeviceDisconnected(peripheral) {
    let toast = this.toastCtrl.create({
      message: 'The peripheral unexpectedly disconnected',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    )
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  //Toggling the variables
  setState(id) {
    let buffer;
    switch (id) {
      case 'cart1':
        if (this.cartridge1) {
          buffer = new Uint8Array([1, 1]).buffer;
        } else {
          buffer = new Uint8Array([1, 0]).buffer;
        }
        break;
      case 'cart2':
        if (this.cartridge2) {
          buffer = new Uint8Array([2, 1]).buffer;
        } else {
          buffer = new Uint8Array([2, 0]).buffer;
        }
        break;
      case 'cart3':
        if (this.cartridge3) {
          buffer = new Uint8Array([3, 1]).buffer;
        } else {
          buffer = new Uint8Array([3, 0]).buffer;
        }
        break;
      case 'cart4':
        if (this.cartridge4) {
          buffer = new Uint8Array([4, 1]).buffer;
        } else {
          buffer = new Uint8Array([4, 0]).buffer;
        }
        break;
      case 'blower1':
        if (this.blower1) {
          buffer = new Uint8Array([5, 1]).buffer;
        } else {
          buffer = new Uint8Array([5, 0]).buffer;
        }
        break;
      case 'blower2':
        if (this.blower2) {
          buffer = new Uint8Array([6, 1]).buffer;
        } else {
          buffer = new Uint8Array([6, 0]).buffer;
        }
        break;
      case 'cart1Tim':
        if (this.timer[0].status) {
          buffer = new Uint8Array([7, 1]).buffer;
        } else {
          buffer = new Uint8Array([7, 0]).buffer;
        }
        break;
      case 'cart2Tim':
        if (this.timer[1].status) {
          buffer = new Uint8Array([8, 1]).buffer;
        } else {
          buffer = new Uint8Array([8, 0]).buffer;
        }
        break;
      case 'cart3Tim':
        if (this.timer[2].status) {
          buffer = new Uint8Array([9, 1]).buffer;
        } else {
          buffer = new Uint8Array([9, 0]).buffer;
        }
        break;
      case 'cart4Tim':
        if (this.timer[3].status) {
          buffer = new Uint8Array([10, 1]).buffer;
        } else {
          buffer = new Uint8Array([10, 0]).buffer;
        }
        break;
      default:
        buffer = new Uint8Array([19, 0]).buffer;
    }
    this.ble.write(this.peripheral.id, SERVICE, WRITE_CHARACTERISTIC, buffer).then(
      () => console.log("success"),
      e => console.log("failed")
    );
  }

  changeTime(time, type) {
    let buffer;
    if (type == "on") {
      switch (time.bodyLabel) {
        case "cart1Tim":
          buffer = new Uint8Array([11, time.onTime]).buffer;
          break;
        case "cart2Tim":
          buffer = new Uint8Array([12, time.onTime]).buffer;
          break;
        case "cart3Tim":
          buffer = new Uint8Array([13, time.onTime]).buffer;
          break;
        case "cart4Tim":
          buffer = new Uint8Array([14, time.onTime]).buffer;
          break;
        default:
          buffer = new Uint8Array([14, 10]).buffer;
      }
    } else {
      switch (time.bodyLabel) {
        case "cart1Tim":
          buffer = new Uint8Array([15, time.offTime]).buffer;
          break;
        case "cart2Tim":
          buffer = new Uint8Array([16, time.offTime]).buffer;
          break;
        case "cart3Tim":
          buffer = new Uint8Array([17, time.offTime]).buffer;
          break;
        case "cart4Tim":
          buffer = new Uint8Array([18, time.offTime]).buffer;
          break;
        default:
          buffer = new Uint8Array([18, 10]).buffer;
      }
    }
    this.ble.write(this.peripheral.id, SERVICE, WRITE_CHARACTERISTIC, buffer).then(
      () => console.log("success"),
      e => console.log("failed")
    );
  }

  updateUI(data) {
    data = data.toString();
    console.log(data);
    if (parseInt(data.charAt(0)) > 0) {
      this.cartridge1 = true;
    } else {
      this.cartridge1 = false;
    }
    if (parseInt(data.charAt(1)) > 0) {
      this.cartridge2 = true;
    } else {
      this.cartridge2 = false;
    }
    if (parseInt(data.charAt(2)) > 0) {
      this.cartridge3 = true;
    } else {
      this.cartridge3 = false;
    }
    if (parseInt(data.charAt(3)) > 0) {
      this.cartridge4 = true;
    } else {
      this.cartridge4 = false;
    }
    if (parseInt(data.charAt(4)) > 0) {
      this.blower1 = true;
    } else {
      this.blower1 = false;
    }
    if (parseInt(data.charAt(5)) > 0) {
      this.blower2 = true;
    } else {
      this.blower2 = false;
    }
    if (parseInt(data.charAt(6)) > 0) {
      this.timer[0].status = true;
    } else {
      this.timer[0].status = false;
    }
    if (parseInt(data.charAt(7)) > 0) {
      this.timer[1].status = true;
    } else {
      this.timer[1].status = false;
    }
    if (parseInt(data.charAt(8)) > 0) {
      this.timer[2].status = true;
    } else {
      this.timer[2].status = false;
    }
    if (parseInt(data.charAt(9)) > 0) {
      this.timer[3].status = true;
    } else {
      this.timer[3].status = false;
    }
  }

}
