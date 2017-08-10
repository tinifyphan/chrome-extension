import {RestClientService} from "../../go1core/services/RestClientService";
import {Injectable} from "@angular/core";
import {StorageService} from "../../go1core/services/StorageService";
import configuration from "../../../environments/configuration";

@Injectable()
export class PortalService {
  constructor(private restClientService: RestClientService,
              private storageService: StorageService) {

  }

  async getPortalForUser() {
    const uuid = this.storageService.retrieve(configuration.constants.localStorageKeys.uuid);

    let response = await this.restClientService.get(`${configuration.environment.baseApiUrl}/${configuration.serviceUrls.portal}public-key/${uuid}`);
  }

  async getPortal(id: string | number) {
    let response = await this.restClientService.get(`${configuration.environment.baseApiUrl}/${configuration.serviceUrls.portal}${id}`);
    return response;
  }

  setDefaultPortal(portal: any) {
    this.storageService.store(configuration.constants.localStorageKeys.currentActivePortalId, portal.id);
    this.storageService.store(configuration.constants.localStorageKeys.currentActivePortal, portal);
  }

  getDefaultPortalSetting() {
    return this.storageService.retrieve(configuration.constants.localStorageKeys.currentActivePortalId);
  }

  async getDefaultPortalInfo() {
    return this.getPortal(this.getDefaultPortalSetting() || configuration.environment.defaultPortal);
  }

  async getPortals() {
    return this.storageService.retrieve(configuration.constants.localStorageKeys.portalInstances);
  }
}
