import {Component} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {ActionSheetController, AlertController, Platform, ToastController} from "ionic-angular";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {File} from "@ionic-native/file";
import {FilePath} from "@ionic-native/file-path";
import {TransferObject} from "@ionic-native/transfer";
import {ToastService} from "../../services/toast.service";

@Component({
    selector: 'multi-image-upload',
    templateUrl: 'multi-image-upload.html',
    providers: [Camera, File, FilePath, Platform]
})

export class MultiImageUpload {
    public serverUrl = "http://jquery-file-upload.appspot.com/";

    public isUploading = false;
    public uploadingProgress = {};
    public uploadingHandler = {};
    public images: any = [];
    protected imagesValue: Array<any>;
    public hasImages: boolean = true;

    constructor(
      private sanitization: DomSanitizer,
      private actionSheetCtrl: ActionSheetController,
      private camera: Camera,
      private file: File,
      public toastService: ToastService
    ) {
    }

    public uploadImages(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.isUploading = true;
            Promise.all(this.images.map(image => {
                return this.uploadImage(image);
            }))
                .then(resolve)
                .catch(reason => {
                    this.isUploading = false;
                    this.uploadingProgress = {};
                    this.uploadingHandler = {};
                    reject(reason);
                });

        });
    }

    public abort() {
        if (!this.isUploading)
            return;
        this.isUploading = false;
        for (let key in this.uploadingHandler) {
            this.uploadingHandler[key].abort();
        }
    }

    // ======================================================================

    protected removeImage(image) {
        if (this.isUploading)
            return;
        this.util.removeFromArray(this.imagesValue, image);
        this.util.removeFromArray(this.images, image.url);
    }

    protected showAddImage() {
        if (!window['cordova']) {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = "image/x-png,image/gif,image/jpeg";
            input.click();
            input.onchange = () => {
                let blob = window.URL.createObjectURL(input.files[0]);
                this.images.push(blob);
                this.util.trustImages();
            }
        } else {
            new Promise((resolve, reject) => {
                let actionSheet = this.actionSheetCtrl.create({
                    title: 'Добавить изображение',
                    buttons: [
                        {
                            text: 'Загрузить из галереи',
                            handler: () => {
                                resolve(this.camera.PictureSourceType.PHOTOLIBRARY);
                            }
                        },
                        {
                            text: 'Камера',
                            handler: () => {
                                resolve(this.camera.PictureSourceType.CAMERA);
                            }
                        },
                        {
                            text: 'Отмена',
                            role: 'cancel',
                            handler: () => {
                                reject();
                            }
                        }
                    ]
                });
                actionSheet.present();
            }).then(sourceType => {
                if (!window['cordova'])
                    return;
                let options: CameraOptions = {
                    quality: 100,
                    sourceType: sourceType as number,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                this.camera.getPicture(options).then((imagePath) => {
                    this.images.push(imagePath);
                    this.util.trustImages();
                });
            }).catch(() => {
            });
        }
    }


    private uploadImage(targetPath) {
        return new Promise((resolve, reject) => {
            this.uploadingProgress[targetPath] = 0;

            if (window['cordova']) {
                let options = {
                    fileKey: "files[]",
                    fileName: targetPath,
                    chunkedMode: false,
                    mimeType: "multipart/form-data",
                };
                const fileTransfer = new TransferObject();
                this.uploadingHandler[targetPath] = fileTransfer;

                fileTransfer.upload(targetPath, this.serverUrl, options).then(data => {
                    resolve(JSON.parse(data.response));
                    console.log('cccccooonsole');
                }).catch(err => {
                  this.toastService.showToast('Ошибка загрузки изображения!');
                });

                fileTransfer.onProgress(event2 => {
                    this.uploadingProgress[targetPath] = event2.loaded * 100 / event2.total;
                });
            } else {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', targetPath, true);
                xhr.responseType = 'blob';
                xhr.onload = (e) => {
                    if (xhr['status'] != 200) {
                        this.util.showToast("Your browser doesn't support blob API");
                        console.error(e, xhr);
                    } else {
                        const blob = xhr['response'];
                        let formData: FormData = new FormData(),
                            xhr2: XMLHttpRequest = new XMLHttpRequest();
                        formData.append('files[]', blob);
                        this.uploadingHandler[targetPath] = xhr2;
                        xhr2.onreadystatechange = () => {
                            if (xhr2.readyState === 4) {
                                if (xhr2.status === 200)
                                    resolve(JSON.parse(xhr2.response));
                            }
                        };

                        xhr2.upload.onprogress = (event) => {
                            this.uploadingProgress[targetPath] = event.loaded * 100 / event.total;
                        };
                      console.log('cccccooonsole222');
                        xhr2.open('POST', this.serverUrl, true);
                        xhr2.send(formData);
                    }
                };
                xhr.send();
            }
        });
    }

    private util = ((_this: any) => {
        return {
            removeFromArray<T>(array: Array<T>, item: T) {
                let index: number = array.indexOf(item);
                if (index !== -1) {
                    array.splice(index, 1);
                }
            },
            trustImages() {
                _this.imagesValue = _this.images.map(
                    val => {
                        return {
                            url: val,
                            sanitized: _this.sanitization.bypassSecurityTrustStyle("url(" + val + ")")
                        }
                    }
                );
            },
            showToast(text: string) {
                _this.toastCtrl.create({
                    message: text,
                    duration: 5000,
                    position: 'top'
                }).present();
            }
        }
    })(this);
}
