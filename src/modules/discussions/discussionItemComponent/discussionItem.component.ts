import {Component, Input, OnInit} from "@angular/core";
import {ModalDialogService} from "../../go1core/services/ModalDialogService";
import {DiscussionService} from "../services/discussion.service";
import {Router} from "@angular/router";
import configuration from "../../../environments/configuration";
import {UserService} from "../../membership/services/user.service";
import {commandKeys} from "../../../environments/commandKeys";

@Component({
  selector: 'app-discussion-item',
  templateUrl: './discussionItem.component.pug',
  styleUrls: ['./discussionItem.component.scss']
})
export class DiscussionItemComponent implements OnInit {
  postingReply: boolean;
  @Input() discussionItem: any;

  replyMessage: string = '';
  discussionStarted: boolean = false;
  quoteTextLimit = 40;

  constructor(private modalDialogService: ModalDialogService,
              private userService: UserService,
              private discussionService: DiscussionService) {
  }

  ngOnInit() {
  }

  async deleteItem() {
    const confirm = await this.modalDialogService.showConfirmation(
      'This action can not be undone. Are you sure you want to remove this discussion?',
      'Delete Discussion',
      'Yes, Delete It',
      'No',
      'btn-danger'
    );

    if (confirm) {
      await this.discussionService.deleteNote(this.discussionItem.noteItem.uuid);
      this.discussionService.onNoteDeleted.emit(this.discussionItem.noteItem.uuid);
    }
  }

  getEllipsisQuoteText() {
    if (this.discussionItem.quote.length < this.quoteTextLimit) {
      return this.discussionItem.quote;
    }
    return this.discussionItem.quote.substr(0, this.quoteTextLimit) + '...';
  }

  jumpToQuotedText() {
    if (!this.discussionItem.noteItem.entities[0].quotation) {
      return;
    }

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: commandKeys.jumpToQuotedText,
          data: this.discussionItem.noteItem.entities[0]
        }, function (response) {

        });
      });
    });
  }

  toggleDiscussion() {
    this.discussionStarted = !this.discussionStarted;
  }

  async addReply() {
    let user: any = await this.userService.getUser();

    let noteReplydata = {
      message: this.replyMessage,
      user_id: user.id,
      created: new Date().getTime()
    };

    this.postingReply = true;
    await this.discussionService.addMessage(this.discussionItem.noteItem.uuid, noteReplydata);
    this.replyMessage = '';
    this.postingReply = false;
  }
}
