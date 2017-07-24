import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DiscussionService} from "../services/discussion.service";
import {UserService} from "../../membership/services/user.service";
import {Go1RuntimeContainer} from "../../go1core/services/go1RuntimeContainer";

@Component({
  selector: 'app-new-discussion',
  templateUrl: '../../../views/newDiscussionComponent.tpl.jade',
  styleUrls: ['./newDiscussion.component.scss']
})
export class NewDiscussionComponent implements OnInit {
  data: any;
  private user: any;

  constructor(private router: Router,
              private discussionService: DiscussionService,
              private currentActivatedRoute: ActivatedRoute,
              private userService: UserService) {
    console.log(Go1RuntimeContainer.currentChromeTab);
    this.data = {
      title: '',
      body: '',
      entityType: 'portal',
      item: Go1RuntimeContainer.currentChromeTab.url,
      entityId: localStorage.getItem('activeInstance')
    };
  }

  async ngOnInit() {
    this.data.user = this.userService.getUser();
  }

  async goBack() {
    this.router.navigate(['../'], {relativeTo: this.currentActivatedRoute});
  }

  async addNote() {
    await this.discussionService.createNote(this.data);
    await this.goBack();
  }
}
