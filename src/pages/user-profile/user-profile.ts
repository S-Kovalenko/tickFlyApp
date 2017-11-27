import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {PostPage} from "../post/post";
import {HttpService} from "../../services/http.service";
import {FollowersPage} from "../followers/followers";
import {FollowedPage} from "../followed/followed";
import {EditUserPage} from "../edit-user/edit-user";
import {ChangePasswordPage} from "../change-password/change-password";
import {CategoryPage} from "../category/category";
import {PostService} from "../../services/post.service";

/**
 * Generated class for the UserProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
  providers: [UserService, PostService]
})
export class UserProfilePage {

  userId: number;
  posts = [];
  public: boolean = true;
  subscribe;
  user;
  followersCount: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private userService: UserService,
    public alertCtrl: AlertController,
    private httpService: HttpService
  ) {
    this.userId = this.navParams.get('userId');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserProfilePage');
  }

  onPostPage(postId) {
    let post;
    this.httpService.getPost(postId)
      .subscribe(
        response => {
          console.log(response.json().post);
          post = response.json().post;
          this.navCtrl.push(PostPage, {post: post});
        },
        error => {
          console.log(error);
        }
      );
  }

  ngOnInit() {
    this.userService.getProfile(this.userId)
      .subscribe(
        response => {
          console.log(response.json());
          this.user = response.json().user;
          let postsList = response.json().posts;
          this.public = response.json().public;
          this.subscribe = response.json().subscribe;
          this.followersCount = this.user.followers_count;
          for(let index in postsList){
            let post = postsList[index];
            this.posts.push({
              postId: post.id_post,
              title: post.title,
              categories: post.categories,
              description: post.description,
              tags: post.tags,
              tickCount: post.summ_ticks,
              date: post.format_date,
              media: post.media
            });
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      buttons: ['Подписаться', 'Поделиться', 'Пожаловаться']
    });
    alert.present();
  }

  onFollowersPage(userId) {
    let followersList;
    this.userService.getFollowers(userId)
      .subscribe(
        response => {
          followersList = response.json().followers;
          this.navCtrl.push(FollowersPage, {followersList: followersList});
        },
        error => {
          console.log();
        }
      );
  }

  onFollowedPage(userId) {
    let followedList;
    this.userService.getFollowed(userId)
      .subscribe(
        response => {
          followedList = response.json().followed;
          this.navCtrl.push(FollowedPage, {followedList: followedList});
        },
        error => {
          console.log();
        }
      );
  }

  onToggleSubscribe(userId) {
    this.userService.toggleSubscribe(userId)
      .subscribe(
        response => {
          console.log(response.json());
          this.followersCount = response.json().followers_count;
          console.log(this.followersCount);
        },
        error => {
          console.log('error');
        }
      )
  }

  onEditUserPage() {
    this.navCtrl.push(EditUserPage);
  }

  onChangePasswordPage() {
    this.navCtrl.push(ChangePasswordPage);
  }

  showAlertUserEdit() {
    let alert = this.alertCtrl.create({
      buttons: [
        {
          text: 'Редактировать профиль',
          handler: () => {
            this.onEditUserPage();
          }
        },
        {
          text: 'Изменить пароль',
          handler: () => {
            this.onChangePasswordPage();
          }
        }
      ]
    });
    alert.present();
  }

  // onAuthorPage(userId) {
  //   this.navCtrl.push(UserProfilePage, {userId: userId});
  // }
  //
  // onCategoryPage(categoryId) {
  //   this.navCtrl.push(CategoryPage, {categoryId: categoryId});
  // }
}
