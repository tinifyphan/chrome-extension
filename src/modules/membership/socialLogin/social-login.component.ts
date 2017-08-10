import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../services/user.service";
import {ModalDialogService} from "../../go1core/services/ModalDialogService";
import configuration from "../../../environments/configuration";

@Component({
  selector: 'social-login',
  templateUrl: './social-login.component.pug'
})
export class SocialLoginComponent {
  provider: any;
  loggingIn: boolean;
  loggedInSuccess: boolean;

  constructor(private currentRoute: ActivatedRoute,
              private userService: UserService,
              private router: Router,
              private modalDialogService: ModalDialogService) {

  }

  async ngOnInit() {
    this.currentRoute.params.subscribe(async params => {
      this.provider = params['oauthProvider'];

      if (this.provider === 'facebook') {
        this.loginWithFacebook();
      } else if (this.provider === 'google') {
        this.loginWithGoogle();
      } else {
        await this.modalDialogService.showAlert(
          'Unsupported OAuth Provider',
          'Error while requesting for Social Login',
          'Close',
          'btn-danger'
        );
        window.close();
      }
    });
  }

  loginWithFacebook() {
    this.loggingIn = true;

    window.addEventListener('message', (response) => this.onResponse(response));
    window.open(`${configuration.environment.baseApiUrl}/${configuration.serviceUrls.facebookAuth}`, '_blank');
  }

  loginWithGoogle() {
    this.loggingIn = true;

    window.addEventListener('message', (response) => this.onResponse(response));
    window.open(`${configuration.environment.baseApiUrl}/${configuration.serviceUrls.googleAuth}`, '_blank');
  }

  async onResponse(message) {
    if (!message.data)
      return;

    const data = JSON.parse(message.data);
    if (!data)
      return;
    window.removeEventListener('message', (response) => this.onResponse(response));

    await this.userService.getAuthenticatedUserInfo(data.uuid);
    this.loggingIn = false;

    this.loggedInSuccess = true;
    console.log(data);
  }

  close() {
    window.close();
  }
}