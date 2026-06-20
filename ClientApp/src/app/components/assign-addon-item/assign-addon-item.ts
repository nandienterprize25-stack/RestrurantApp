import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem } from '../../models/food-management.models';
import { CustomAlertService } from '../../services/custom-alert.service';

@Component({
    selector: 'app-assign-addon-item',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './assign-addon-item.html'
})
export class AssignAddonItemComponent implements OnInit {
    assignmentForm!: FormGroup;
    primaryDishesList: MenuItem[] = [];
    globalAddonsAvailableList: any[] = [];
    selectedAddonIds: string[] = [];

    constructor(
        private fb: FormBuilder,
        private foodService: FoodManagementService,
        private alertService: CustomAlertService
    ) {
        this.buildAssignmentFormModel();
    }

    ngOnInit(): void {
        this.loadPrimaryProductsAndAddons();
    }

    private buildAssignmentFormModel(): void {
        this.assignmentForm = this.fb.group({
            parentMenuItemId: ['', Validators.required],
            minSelection: [0, [Validators.required, Validators.min(0)]],
            maxSelection: [5, [Validators.required, Validators.min(1)]],
            isRequired: [false]
        });
    }

    private loadPrimaryProductsAndAddons(): void {
        this.foodService.getMenuItems(true).subscribe({
            next: (items: any[]) => {
                // Filter out items that are standalone food items rather than modifiers
                this.primaryDishesList = items.filter(x => !x.isAddon && !x.isGroupItem);
                // Extract global add-ons catalog entries
                this.globalAddonsAvailableList = items.filter(x => x.isAddon === true || x.notes?.includes('Addon'));
            },
            error: () => this.alertService.error('Failed to coordinate dependency records from server endpoints.')
        });
    }

    onParentProductChanged(): void {
        const parentId = this.assignmentForm.get('parentMenuItemId')?.value;
        if (!parentId) {
            this.selectedAddonIds = [];
            return;
        }

        // Locate the item's currently saved configurations
        const selectedItem = this.primaryDishesList.find(x => x.id === parentId) as any;
        if (selectedItem && selectedItem.assignedAddonIds) {
            this.selectedAddonIds = [...selectedItem.assignedAddonIds];
            this.assignmentForm.patchValue({
                minSelection: selectedItem.minAddonCount || 0,
                maxSelection: selectedItem.maxAddonCount || 5,
                isRequired: selectedItem.isAddonRequired || false
            });
        } else {
            this.selectedAddonIds = [];
        }
    }

    isAddonChecked(addonId: string): boolean {
        return this.selectedAddonIds.includes(addonId);
    }

    onAddonCheckboxToggled(event: any, addonId: string): void {
        if (event.target.checked) {
            if (!this.selectedAddonIds.includes(addonId)) {
                this.selectedAddonIds.push(addonId);
            }
        } else {
            this.selectedAddonIds = this.selectedAddonIds.filter(id => id !== addonId);
        }
    }

    onClearAssignmentForm(): void {
        this.selectedAddonIds = [];
        this.assignmentForm.reset({ minSelection: 0, maxSelection: 5, isRequired: false });
    }

    onSaveAssignment(): void {
        if (this.assignmentForm.invalid) return;

        const vals = this.assignmentForm.getRawValue();
        const targetItem = this.primaryDishesList.find(x => x.id === vals.parentMenuItemId);

        if (!targetItem) return;

        // Append modifier metadata arrays on the parent object target configuration model
        const mappingPayload = {
            ...targetItem,
            assignedAddonIds: this.selectedAddonIds,
            minAddonCount: vals.minSelection,
            maxAddonCount: vals.maxSelection,
            isAddonRequired: vals.isRequired
        };

        // Pass the target item ID alongside the mapped parameters to the multi-argument update pipe
        this.foodService.updateMenuItem(vals.parentMenuItemId, mappingPayload).subscribe({
            next: () => {
                this.alertService.success('Modifiers and boundary constraints linked successfully!');
                this.onClearAssignmentForm();
                this.loadPrimaryProductsAndAddons();
            },
            error: () => this.alertService.error('The database rejected the assignment structural payload mapping update.')
        });
    }
}