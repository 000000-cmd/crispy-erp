import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ContainerComponent } from "../ui/container.component";
import { LucideAngularModule, Trash } from "lucide-angular";
import { InputCleanComponent } from "../forms/inputs/input-clean.component";


@Component({
    selector: 'item-percentage',
    template:`
    <ui-container >
        <div class="flex  justify-between items-center">
            <div class="flex flex-col flex-1 ">
                <p class="font-medium text-base">{{ title }}</p>

            </div>

            <!-- Botón eliminar -->
            <div class="flex gap-4 items-center text-center">
                <div class="w-18">
                    <input-clean
                    variant="filled"
                    />
                </div>

                <p>%</p>

                <button 
                    class="text-red-500 hover:text-red-600"
                    (click)="onDelete()"
                >
                    <lucide-icon [name]="deleteIcon" />
                </button>
            </div>
        </div>

    </ui-container>
    `,
    host: {
        class: 'flex-1'
    },
    standalone: true,
    imports:[ContainerComponent, LucideAngularModule, InputCleanComponent]

})

export class ItemPercentageComponent{


    readonly deleteIcon = Trash;

    @Input() title :string = "Comisiones"
    @Input() percentage: number|string = "%60"


    @Output() delete = new EventEmitter<void>();

    onDelete() {
        this.delete.emit();
    }

}