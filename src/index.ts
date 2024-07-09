import Kasumi, { BaseMenu } from "kasumi.js";
import apexSearchCommand from "./commands/search";
import apexConnectCommand from "./commands/connect";

export default class ApexMenu extends BaseMenu {
    constructor(name: string = "apex") {
        super();
        this.name = name;
    }

    init(client: Kasumi<any>, loggerSequence: string[]): void {
        super.init(client, loggerSequence);

        this.load(apexSearchCommand);
        this.load(apexConnectCommand);
    }
}
