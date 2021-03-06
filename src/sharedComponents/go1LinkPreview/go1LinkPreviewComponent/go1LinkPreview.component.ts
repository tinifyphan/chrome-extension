import {Component, EventEmitter, Input, NgZone, Output} from "@angular/core";
import {commandKeys} from "../../../environments/commandKeys";

@Component({
  selector: 'go1-link-preview',
  templateUrl: './go1LinkPreview.component.pug'
})
export class Go1LinkPreviewComponent {
  @Input('linkUrl') linkUrl: any;

  @Input() linkPreview: any = {};
  @Output() linkPreviewChange: EventEmitter<any> = new EventEmitter<any>();

  isLoading = false;

  constructor(private zone: NgZone) {

  }

  async ngAfterViewInit() {
    if (!this.linkPreview) {
      this.linkPreview = {};
    }
    await this.loadLinkPreviewData();
  }

  public async loadLinkPreviewData() {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: commandKeys.getLinkPreview,
        data: this.linkUrl
      }, (response) => {
        if (this.zone) {
          this.zone.run(() => {
            this.linkPreview = response.data;
            this.isLoading = false;
            this.linkPreviewChange.emit(this.linkPreview);
            resolve();
          });
        }else {
          this.linkPreview = response.data;
          this.isLoading = false;
          this.linkPreviewChange.emit(this.linkPreview);
          resolve();
        }
      });
    });
  }
}
