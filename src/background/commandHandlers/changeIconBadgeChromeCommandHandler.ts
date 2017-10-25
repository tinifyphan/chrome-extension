import {IChromeCommandHandler} from "../../services/chromeCommandHandlerService/IChromeCommandHandler";
import {commandKeys} from "../../environments/commandKeys";

export class ChangeIconBadgeChromeCommandHandler implements IChromeCommandHandler {
  command = commandKeys.changeBrowserActionBadgeText;

  constructor() {
  }

  handle(request: any, sender: any, sendResponse: Function) {
    chrome.browserAction.setBadgeText({
      text: request.text || '',
      tabId: sender.tab.id
    });
    chrome.browserAction.setTitle({
      title: request.title || '',
      tabId: sender.tab.id
    });

    sendResponse({success: true});
  }
}