import { Component, ElementRef, OnInit, QueryList, ViewChild, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { IonContent, IonList } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AlertController, ToastController, MenuController, Platform , ModalController} from '@ionic/angular';
import { timer } from 'rxjs';

@Component({
  selector: 'app-modal-timer',
  templateUrl: 'modal-timer.page.html',
  styleUrls: ['modal-timer.page.scss'],
})
export class ModalTimerPage implements OnInit {

  time = this.navParams.get('value');


  

  opts = {
    freeMode: true,
    slidesPerView: 2.8,
    slidesOffsetBefore: 30,
    slidesOffsetAfter: 100
  }

  constructor(private router: Router, private toastCtrl: ToastController, private route: ActivatedRoute, private modalCtrl: ModalController, private navParams: NavParams) { 

  }

  ngOnInit() {

  }

  close() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss({time: this.time});
  }

  ionViewWillEnter(){
  }

  ionViewWillLeave(){
  }

  

}
