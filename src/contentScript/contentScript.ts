import * as _ from 'lodash';

import {Go1ExtensionInjectionArea} from "./go1ExtensionInjectionArea";
import {commandKeys} from "../commandHandlers/commandKeys";
import {ChromeCmdHandleService} from "../commandHandlers/ChromeCmdHandleService";
import {JumpToQuoteTextChromeCommandHandler} from "./commandHandlers/jumpToQuoteTextChromeCommandHandler";
import {RemoveAllHighlightChromeCommandHandler} from "./commandHandlers/removeAllHighlightChromeCommandHandler";
import {GetLinkPreviewChromeCommandHandler} from "./commandHandlers/GetLinkPreviewChromeCommandHandler";
import configuration from "../environments/configuration";
import {CloseExtensionPopupChromeCommandHandler} from "./commandHandlers/CloseExtensionPopupChromeCommandHandler";

declare const $: any;
const ignoringDomains = ['mygo1.com', 'go1.com', 'www.google.com/maps'];

(function () {
  const shouldIgnore = _.some(ignoringDomains, (domain) => window.location.href.indexOf(domain) > -1);

  if (shouldIgnore) {
    return;
  }

  $('head').append('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />');

  const commandHandlerService = new ChromeCmdHandleService();
  commandHandlerService.registerHandler(new RemoveAllHighlightChromeCommandHandler());
  commandHandlerService.registerHandler(new JumpToQuoteTextChromeCommandHandler());
  commandHandlerService.registerHandler(new GetLinkPreviewChromeCommandHandler());
  commandHandlerService.registerHandler(new CloseExtensionPopupChromeCommandHandler());

  Go1ExtensionInjectionArea.initialize();

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (commandHandlerService.hasHandler(msg.name)) {
      commandHandlerService.handleCommand(msg.name, msg, sender, sendResponse);
      return true;
    }

    if (msg.name === commandKeys.checkQuickButtonSettings) {
      Go1ExtensionInjectionArea.toggleQuickButton();
      sendResponse({success: true});
      return true;
    }

    if (msg.name === commandKeys.checkHighlightNoteSettings) {
      Go1ExtensionInjectionArea.toggleHighlightArea();
      sendResponse({success: true});
      return true;
    }

    if (msg.name === commandKeys.checkCreateNoteSettings) {
      Go1ExtensionInjectionArea.toggleCreateNote();
      sendResponse({success: true});
      return true;
    }

    if (msg.name === commandKeys.getLinkPreview) {
      sendResponse({success: true, data: document.documentElement.innerHTML});
      return true;
    }

    sendResponse({success: false, error: new Error('No command handler found for request action'), errorData: msg});
  });
})();
