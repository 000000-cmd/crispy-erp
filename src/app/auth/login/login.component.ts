import { Component } from "@angular/core";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { InputCleanComponent } from "../../shared/components/forms/inputs/input-clean.component";
import { Lock, LogIn, Mail } from "lucide-angular";
import { CheckboxComponent } from "../../shared/components/forms/checkbox/check-box.component";
import { TextLinkComponent } from "../../shared/components/ui/text-link.component";
import { ButtonCleanComponent } from "../../shared/components/buttons/button-clean.component";


@Component({
    selector:'login',
    standalone:true,
    templateUrl:'./login.component.html',
    imports: [ContainerComponent, InputCleanComponent, CheckboxComponent, TextLinkComponent, ButtonCleanComponent],
})

export class LoginComponent{
    readonly emailIcon= Mail;
    readonly passswordIcon= Lock;
    readonly loginIcon = LogIn;
}