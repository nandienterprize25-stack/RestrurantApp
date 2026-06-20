import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem, Category } from '../../models/food-management.models';
import { CustomAlertService } from '../../services/custom-alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

// @Component({
//     selector: 'app-create-combo-item',
//     standalone: true,
//     imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
//     templateUrl: './create-combo-item.component.html'
// })

@Component({
    selector: 'app-create-combo-item',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './create-combo-item.html' // <-- Changed this line to match your file name exactly
})
export class CreateComboItemComponent implements OnInit {
    private gridApi!: GridApi;
    
    groupComboForm!: FormGroup;
    categoriesList: Category[] = [];
    standaloneItemsList: MenuItem[] = [];
    gridRowData: any[] = [];

    // FIXED: Formatted the cell renderer cleanly to display your missing action control strip
    gridColumnDefinitions: ColDef[] = [
        { headerName: 'Combo Platter Name', field: 'name', sortable: true, filter: true, flex: 2, cellStyle: { fontWeight: '700', color: '#0f172a' } },
        { headerName: 'Assigned Kitchen', field: 'kitchenName', sortable: true, filter: true, flex: 1 },
        { headerName: 'Base Rate', field: 'price', valueFormatter: p => '$' + p.value, sortable: true, flex: 1, cellStyle: { color: '#16a34a', fontWeight: '700' } },
        { headerName: 'Status', field: 'isActive', flex: 1, cellRenderer: (p: any) => p.value ? '🟢 Live' : '🔴 Hidden' },
        {
            headerName: 'Control Actions Panel',
            field: 'id',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                // Injected native HTML event handler strings to fix rendering mismatches inside AG-Grid modules
                return `<button class="action-btn delete-btn" data-action="delete" style="padding: 6px 14px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; font-size: 11px; cursor: pointer; color: #e53e3e; font-weight: 700; height: 32px; display: inline-flex; align-items: center; justify-content: center; margin-top: 10px;">🗑️ Delete Combo</button>`;
            }
        }
    ];

    constructor(
        private fb: FormBuilder, 
        private foodService: FoodManagementService, 
        private alertService: CustomAlertService
    ) {
        this.buildReactiveCreationForm();
    }

    ngOnInit(): void {
        this.fetchFormDropdownDependencies();
        this.loadSavedComboGridRows();
    }

    private buildReactiveCreationForm(): void {
        this.groupComboForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            categoryId: ['', Validators.required],
            price: ['', [Validators.required, Validators.min(0)]],
            vatPercentage: [0, [Validators.min(0)]],
            kitchenName: ['Main Kitchen', Validators.required],
            cookingTime: [15, [Validators.min(1)]],
            typeBreakfast: [false],
            typeLunch: [false],
            typeDinner: [false],
            components: this.fb.array([])
        });
        this.addComponentRow();
    }

    get componentsArray(): FormArray {
        return this.groupComboForm.get('components') as FormArray;
    }

    addComponentRow(): void {
        const row = this.fb.group({
            childMenuItemId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]]
        });
        this.componentsArray.push(row);
    }

    removeComponentRow(index: number): void {
        if (this.componentsArray.length <= 1) {
            this.alertService.error('Combo items require at least one mapping sub-item track logic row.');
            return;
        }
        this.componentsArray.removeAt(index);
    }

    private fetchFormDropdownDependencies(): void {
        this.foodService.getCategories(false).subscribe({
            next: (cats) => this.categoriesList = cats
        });

        this.foodService.getMenuItems(true).subscribe({
            next: (items: MenuItem[]) => {
                this.standaloneItemsList = items.filter(x => !x.isGroupItem);
            }
        });
    }

    loadSavedComboGridRows(): void {
        this.foodService.getMenuItems(true).subscribe({
            next: (items: any[]) => {
                this.gridRowData = items.filter(x => x.isGroupItem === true);
            }
        });
    }

    onComboGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    onResetFormLayout(): void {
        this.groupComboForm.reset({ kitchenName: 'Main Kitchen', cookingTime: 15, vatPercentage: 0 });
        while (this.componentsArray.length !== 0) this.componentsArray.removeAt(0);
        this.addComponentRow();
    }

    onSubmitComboForm(): void {
        if (this.groupComboForm.invalid) return;

        const vals = this.groupComboForm.value;
        const productionPayload = {
            name: vals.name,
            categoryId: vals.categoryId,
            price: vals.price,
            vatPercentage: vals.vatPercentage || 0,
            kitchenName: vals.kitchenName,
            cookingTime: vals.cookingTime || 15,
            isGroupItem: true,
            isActive: true,
            isSpecial: false,
            hasOffer: false,
            notes: 'System Created Combo Group Package Deal Object Container Model Line Item.',
            image: 'assets/images/menu/bbq-family-deal.jpg',
            groupComponents: vals.components,
            availabilities: [{ availableFrom: "00:00:00", availableTo: "23:59:59", isAvailableAllDay: true }],
            variants: []
        };

        this.foodService.createMenuItem(productionPayload).subscribe({
            next: () => {
                this.alertService.success('Group Food Combo registered in database safely!');
                this.onResetFormLayout();
                this.loadSavedComboGridRows();
            },
            error: (err) => this.alertService.error(err.error?.message || 'Failed to dispatch configuration properties.')
        });
    }

    onGridCellClicked(event: any): void {
        if (!event.event || !event.event.target) return;
        const target = event.event.target as HTMLElement;
        const action = target.getAttribute('data-action');

        if (action === 'delete') {
            if (confirm(`Are you certain you want to purge the entity bundle listing: "${event.data.name}"?`)) {
                this.foodService.deleteMenuItem(event.data.id).subscribe({
                    next: () => {
                        this.alertService.success('Combo bundle entry completely dropped from data indexing tables.');
                        this.loadSavedComboGridRows();
                    },
                    error: () => this.alertService.error('Could not clean targets record row line nodes.')
                });
            }
        }
    }
}