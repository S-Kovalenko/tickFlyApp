import {Component, Provider} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Chat} from "../../models/chat";
import {ChatService} from "../../services/chat.service";
import {NgForm} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {LoaderService} from "../../services/loader.service";
import {User} from "../../models/user";
import {Message} from "../../models/message";
import {SocketService} from "../../services/socket.service";

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [ChatService, LoaderService],
})
export class ChatPage {
  chat: Chat;
  chatId: number;
  userId: number;
  interlocutor: User;
  messageListener;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public chatService: ChatService,
              public authService: AuthService,
              public loadService: LoaderService,
              public socketService: SocketService) {
    this.chat = new Chat();
    this.chat.messages = [];
    this.interlocutor = new User();
  }

  ionViewDidLoad() {
    this.userId = Number(this.authService.getUserId());
    this.chatId = this.navParams.get("chatId");
    this.getChat();
  }

  destroyListeners() {
    this.messageListener.unsubscribe();
  }

  ionViewDidLeave() {
    console.log("Listeners destroyed");
    this.destroyListeners();
  }

  startListening() {
    this.messageListener = this.socketService.getMessages().subscribe(data => {
      if (data['senderId'] == this.interlocutor.id && data['chatId'] == this.chatId) {
        let msg = new Message();
        msg.message = data['text'];
        msg.userId = data['senderId'];
        msg.message_type = "text";
        this.chat.messages.push(msg);
      }
    });
  }


  getChat() {
    const lStorageKey = "chatMessages_" + this.chatId;
    console.log("chat1", this.chat.messages);
    if (!localStorage.getItem(lStorageKey)) {
      console.log("chat2", this.chat.messages);
      const messages = JSON.parse(localStorage.getItem(lStorageKey));
      this.chat.messages = messages;
      console.log("chat2_1", this.chat.messages);
    } else {
      console.log("chat3", this.chat.messages);
      this.loadService.showLoader();
    }

    this.chatService.getChat(this.chatId).subscribe(
      response => {
        console.log("chat4", this.chat.messages);
        this.chat.messages = response.json().messages.map(message => {
          message.userId = message.user_id;
          return message;
        });
        console.log("chat5", this.chat.messages);
        localStorage.setItem(lStorageKey, JSON.stringify(this.chat.messages));

        let interlocutor = response.json().members.filter(member => {
          return member.user.id_user != this.userId;
        })[0];

        this.interlocutor.id = interlocutor.user.id_user;
        this.interlocutor.avatar = interlocutor.user.avatar;
        this.interlocutor.firstName = interlocutor.user.first_name;
        this.interlocutor.lastName = interlocutor.user.last_name;
        this.interlocutor.nickname = interlocutor.user.nick_name;
        this.interlocutor.email = interlocutor.user.email;
        this.loadService.hideLoader();
        this.startListening();
      },
      error => {
        this.loadService.hideLoader();
      }
    )
  }


  sendMessage(form: NgForm) {
    console.log(form.value.message);

    this.chatService.sendMessage(this.chatId, form.value.message)
      .subscribe(
        response => {
          this.socketService.emitChatMessage(form.value.message, this.chatId, this.userId);
          this.chat.messages.push({
              userId: Number(this.userId),
              message: form.value.message
            }
          );
          form.reset();
        },
        error => {
          console.log('Error');
        }
      );
  }

}
