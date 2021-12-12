import { Component, ViewChild, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, IonRouterOutlet, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { CalendarComponent } from 'ionic2-calendar';
import { CalModalPage } from '../../modals/cal-modal/cal-modal.page';
import { ModalTimerPage } from '../../modals/modal-timer/modal-timer.page';
import { formatDate } from '@angular/common';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { timer, Observable } from 'rxjs';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage implements OnInit {
  // Gets a reference to the list element
  @ViewChild('scheduleList', { static: true }) scheduleList: IonList;

  ios: boolean;
  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  groups: any = [];
  confDate: string;
  showSearchbar: boolean;
  data: any;
  tempEvents = [];
  eventSource = [];
  newEvent: boolean = true;
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
  viewTitle;
  pauseTime;

  calendar = {
    mode: 'month',
    currentDate: new Date()
  };

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    @Inject(LOCALE_ID) private locale: string,
  ) { }

  ngOnInit() {
    this.loadEvents();
    this.pauseTime = JSON.parse(localStorage.getItem('pauseTime'));
    this.data = JSON.parse(localStorage.getItem('shifts'));
    // if(data == null)
    //   localStorage.setItem('athleteData',JSON.stringify(user));
    this.ios = this.config.get('mode') === 'ios';
  }

  async loadEvents(){
    this.data = JSON.parse(localStorage.getItem('shifts'));
    this.tempEvents =  this.data ;
    var events = [];
      
    
      await timer(300).subscribe(x => { 
        for (let event_ of this.tempEvents ) {
            events.push({
              title: event_.title,
              startTime : new Date(
                  new Date(event_.startTime).getFullYear(),
                  new Date(event_.startTime).getMonth(),
                  new Date(event_.startTime).getDate(),
                  new Date(event_.startTime).getHours(),
                  0,
                  0,
                  0
              ),
              endTime : new Date(
                  new Date(event_.endTime).getFullYear(),
                  new Date(event_.endTime).getMonth(),
                  new Date(event_.endTime).getDate(),
                  new Date(event_.endTime).getHours(),
                  0,
                  0,
                  0
              ),
              allDay: false,
            });
        }
      });

      await timer(300).subscribe(x => { 
       this.data = JSON.parse(localStorage.getItem('shifts'));
        this.eventSource = events;
        console.log(this.eventSource);
      });

  }

  async openCalModal() {
    let eventCopy = {
      title: "",
      startTime:  new Date(),
      endTime: new Date(),
      allDay: "true",
      desc: ""
    }

    const modal = await this.modalCtrl.create({
      component: CalModalPage,
      cssClass: 'cal-modal',
      backdropDismiss: false
    });
   
    await modal.present();
   
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.event) {
        let event = result.data.event;
        console.log(event);
        

        eventCopy.title = result.data.event.title;
        eventCopy.desc = result.data.event.desc;
        eventCopy.allDay = result.data.event.allDay;
        eventCopy.startTime = new Date(
          new Date(result.data.event.startTime).getFullYear(),
          new Date(result.data.event.startTime).getMonth(),
          new Date(result.data.event.startTime).getDate(),
          new Date(result.data.event.startTime).getHours(),
          0,
          0,
          0
        );
        eventCopy.endTime = new Date(
          new Date(result.data.event.endTime).getFullYear(),
          new Date(result.data.event.endTime).getMonth(),
          new Date(result.data.event.endTime).getDate(),
          new Date(result.data.event.endTime).getHours(),
          0,
          0,
          0
        );
        this.eventSource.push(result.data.event);
        localStorage.setItem('shifts',JSON.stringify(this.eventSource));
        this.data = JSON.parse(localStorage.getItem('shifts'));
        timer(500).subscribe(x => { 
          this.loadEvents();
          this.myCal.loadEvents();
        });
        localStorage.setItem('shifts',JSON.stringify(this.eventSource));
      }
    });
  }

  
  // Change current month/week/day
  next() {
    this.myCal.slideNext();
  }
 
  back() {
    this.myCal.slidePrev();
  }
  
  // Change between month/week/day
  changeMode(mode) {
    this.calendar.mode = mode;
  }
  
  // Focus today
  today() {
    this.calendar.currentDate = new Date();
  }
  
  // Selected date reange and hence title changed
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  
  async logPauseTime(){
    let eventCopy = {
      title: "",
      startTime:  new Date(),
      endTime: new Date(),
      allDay: "true",
      desc: ""
    }

    const modal = await this.modalCtrl.create({
      component: ModalTimerPage,
      cssClass: 'cal-modal',
      backdropDismiss: false
    });
   
    await modal.present();
   
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.time) {
        let pauseTime = result.data.time;
        console.log(pauseTime);
        this.pauseTime = pauseTime;
        localStorage.setItem('pauseTime',JSON.stringify(this.pauseTime));
        this.pauseTime = JSON.parse(localStorage.getItem('pauseTime'));
        timer(500).subscribe(x => { 
          this.loadEvents();
          this.myCal.loadEvents();
        });
      }
    });
  }

  // Calendar event was clicked
  async onEventSelected(event) {
    // Use Angular date pipe for conversion
    let start = formatDate(event.startTime, 'medium', this.locale);
    let end = formatDate(event.endTime, 'medium', this.locale);
    let shiftTimeNetto = ((event.endTime - event.startTime)/3.6e+6) - 0.50;
    let shiftTimeBrutto= ((event.endTime - event.startTime)/3.6e+6) - 0.50;
    let date = formatDate(new Date(), 'medium', this.locale);
    this.presentAlertCalendar('Schicht am '+ date.substring(0,12) , event.desc, 'Schicht<br><br>Von: ' + start + '<br><br>Bis: ' + end + '<br><br>Dezimal:<br><br>Arbeitszeit (netto): ' + shiftTimeNetto + '<br>Pause: '  + 0.50 +'<br>Arbeitszeit (brutto): ' + shiftTimeBrutto, true, event);
    await timer(500).subscribe(x => { 
          //this.resetEvent();
      this.loadEvents();
      this.myCal.loadEvents();
     });
  }

  
  async presentAlert(header:string, subHeader:string, message:string ) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentAlertCalendar(header:string, subHeader:string, message:string, value:boolean, event ) {
    if(value){
      const alert = await this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: header,
        subHeader: subHeader,
        message: message,
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
            handler: () => {
              console.log('Schicht nicht abgebrochen');
            }
          },
          {
            text: 'Schicht löschen',
            handler: () => {
              //this.db.doc(`events/${event.id}`).delete();
              //this.eventService.deleteEvent(event._id);

              
              this.tempEvents = this.eventSource;
             timer(100).subscribe(x => { 

              const index = this.eventSource.indexOf(event, 0);
              if (index > -1) {
                this.eventSource.splice(index, 1);
              }
              
              console.log(this.eventSource);
                // for (let event_ of this.eventSource) {
                  
                //   if(event_.title == event.title ){
                //     this.tempEvents = this.tempEvents.filter(event_ => event_ !== event);
                //     console.log(this.tempEvents);
                //   }
                // }
              });

              localStorage.setItem('shifts',JSON.stringify(this.eventSource));
              this.loadEvents();
              this.presentAlert('Schicht löschen', '', 'Sie haben erfolgreich Ihren Schicht gelöscht!');
              console.log('Schicht gelöscht');
            }
          }
        ]
      });
      await alert.present();
    }
    else{
      const alert = await this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: header,
        subHeader: subHeader,
        message: message,
        buttons: [
          {
            text: 'Schließen',
            role: 'cancel',
            handler: () => {
              console.log('Schichtanzeige geschlossen');
            }
          }
        ]
      
    })
    
    await alert.present();
  }
}
  // Time slot was clicked
  onTimeSelected(ev) {
    let selected = new Date(ev.selectedTime);
    // this.event.startTime = new Date(ev.selectedTime);
    selected.setHours(selected.getHours() + 1);
    // this.event.endTime = new Date(ev.selectedTime);
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
        (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }

  onCurrentDateChanged(event: Date) {
    console.log('current date change: ' + event);
  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      duration: 5000
    });
    toast.present();
  }
}
