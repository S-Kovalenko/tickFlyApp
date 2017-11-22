import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {UserService} from "../../services/user.service";
import {NgForm} from "@angular/forms";

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
  providers: [UserService]
})
export class ChangePasswordPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private userService: UserService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePasswordPage');
  }

  ngOnInit() {
    this.userService.getEditProfile()
      .subscribe(
        response => {
          console.log(response.json());
          // this.user = response.json().user;
        },
        error => {
          console.log(error);
        }
      );
  }

  onChangePassword(form: NgForm) {
    this.userService.changePassword(
      form.value.old_password,
      form.value.new_password,
      form.value.confirmation_password
    ).subscribe(
      response => {
        console.log('Success');
      },
      error => {
        console.log('Error');
      }
    );
  }

}