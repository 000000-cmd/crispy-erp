import { Component } from "@angular/core";
import { ContainerComponent } from "../../shared/components/ui/container.component";
import { InputCleanComponent } from "../../shared/components/forms/inputs/input-clean.component";
import { Lock, LogIn, Mail, User, UserPlus } from "lucide-angular";
import { CheckboxComponent } from "../../shared/components/forms/checkbox/check-box.component";
import { TextLinkComponent } from "../../shared/components/ui/text-link.component";
import { ButtonCleanComponent } from "../../shared/components/buttons/button-clean.component";
import { SelectCleanComponent } from "../../shared/components/forms/selects/select-clean.component";
import { DatePickerComponent } from "../../shared/components/forms/datePicker/date-picker.component";


@Component({
    selector:'register',
    standalone:true,
    templateUrl:'./register.component.html',
    imports: [ContainerComponent, InputCleanComponent, CheckboxComponent, TextLinkComponent, ButtonCleanComponent, SelectCleanComponent,DatePickerComponent ],
})

export class RegisterComponent{
    readonly userIcon = User;
    readonly emailIcon= Mail;
    readonly passswordIcon= Lock;
    readonly loginIcon = UserPlus;

}