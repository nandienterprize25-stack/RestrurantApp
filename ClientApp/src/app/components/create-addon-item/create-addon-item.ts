import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { Category } from '../../models/food-management.models';
import { CustomAlertService } from '../../services/custom-alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { 
    ColDef, 
    GridApi, 
    GridReadyEvent, 
    ModuleRegistry, 
    ClientSideRowModelModule, 
    TextFilterModule, 
    NumberFilterModule, 
    CellStyleModule,
    PaginationModule 
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    CellStyleModule,
    PaginationModule
]);

@Component({
    selector: 'app-create-addon-item',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './create-addon-item.html'
})
export class CreateAddonItemComponent implements OnInit {
    private gridApi!: GridApi;
    
    addonCreationForm!: FormGroup;
    activeCategories: Category[] = [];
    gridRowData: any[] = [];
    editingAddonId: string | null = null;

    gridColumnDefinitions: ColDef[] = [
        { headerName: 'Add-On Description Item', field: 'name', sortable: true, filter: 'agTextColumnFilter', flex: 2, cellStyle: { fontWeight: '700', color: '#0f172a' } },
        { 
            headerName: 'Add-On Group Categorization', 
            field: 'categoryName', 
            sortable: true, 
            filter: 'agTextColumnFilter', 
            flex: 1.5
        },
        { headerName: 'Surcharge Rate', field: 'price', valueFormatter: p => '$' + Number(p.value || 0).toFixed(2), sortable: true, filter: 'agNumberColumnFilter', flex: 1, cellStyle: { color: '#2563eb', fontWeight: '700' } },
        { headerName: 'Status Visibility', field: 'isActive', flex: 1, cellRenderer: (p: any) => p.value ? '🟢 Active' : '🔴 Suspended' },
        {
            headerName: 'Control Actions Panel',
            field: 'id',
            flex: 1.5,
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                return `
                    <div style="display: flex; gap: 8px; align-items: center; height: 100%; margin-top: 6px;">
                        <button class="action-btn edit-btn" data-action="edit" style="padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; cursor: pointer; color: #2563eb; font-weight: 700; height: 32px; display: inline-flex; align-items: center; justify-content: center;">✏️ Edit</button>
                        <button class="action-btn delete-btn" data-action="delete" style="padding: 6px 12px; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px; font-size: 11px; cursor: pointer; color: #e53e3e; font-weight: 700; height: 32px; display: inline-flex; align-items: center; justify-content: center;">🗑️ Delete</button>
                    </div>
                `;
            }
        }
    ];

    constructor(
        private fb: FormBuilder,
        private foodService: FoodManagementService,
        private alertService: CustomAlertService
    ) {
        this.initializeAddonFormModel();
    }

    ngOnInit(): void {
        this.loadCategoriesDropdown();
        this.refreshAddonGridData();
    }

    private initializeAddonFormModel(): void {
        this.addonCreationForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            price: ['', [Validators.required, Validators.min(0)]],
            categoryId: ['', Validators.required],
            isActive: [true]
        });
    }

    private loadCategoriesDropdown(): void {
        this.foodService.getCategories(true).subscribe({
            next: (data) => this.activeCategories = data,
            error: () => this.alertService.error('Could not load menu classification categories dependencies.')
        });
    }
   //Add Here: This method is used to refresh the grid data after any CRUD operation to ensure the UI is always in sync with the latest database state.
    refreshAddonGridData(): void {
        this.foodService.getMenuItems(true).subscribe({
            next: (items: any[]) => {
                console.log("Database Response Data Array:", items);
                
                // 🌟 NATIVE DATABASE PROPERTY FILTER (100% Exact)
                // Since your migration is done, we filter strictly based on your new schema booleans and tags
                this.gridRowData = items.filter(x => {
                    const isAddonColumn = x.isAddon ?? x.IsAddon ?? false;
                    const notesColumn = x.notes ?? x.Notes ?? '';

                    return isAddonColumn === true || notesColumn === 'SYSTEM_MENU_ADDON_RECORD';
                });

                console.log("Filtered Grid Rows (Pure Addons Only):", this.gridRowData);

                if (this.gridApi) {
                    this.gridApi.setGridOption('rowData', this.gridRowData);
                }
            },
            error: () => this.alertService.error('Failed to sync system options registry worksheet rows.')
        });
    }

    onSubmitAddonForm(): void {
        if (this.addonCreationForm.invalid) return;

        const formValues = this.addonCreationForm.getRawValue();
        
        // Formatted model payload targeting your updated SQL architecture properties explicitly
        const databasePayload = {
            name: formValues.name,
            categoryId: formValues.categoryId,
            price: formValues.price,
            vatPercentage: 0,
            kitchenName: 'Main Kitchen',
            cookingTime: 1,
            isGroupItem: false, // Explicitly false so it never leaks into Combo Pages!
            isActive: formValues.isActive ?? true,
            isSpecial: false,
            hasOffer: false,
            image: 'assets/images/menu/addon-default.jpg',
            groupComponents: [],
            availabilities: [{ availableFrom: "00:00:00", availableTo: "23:59:00", isAvailableAllDay: true }],
            variants: [],
            
            // 🌟 YOUR BRAND NEW DB COLUMNS MAP HERE:
            isAddon: true,
            IsAddon: true,
            notes: 'SYSTEM_MENU_ADDON_RECORD',
            Notes: 'SYSTEM_MENU_ADDON_RECORD'
        };

        if (this.editingAddonId) {
            this.foodService.updateMenuItem(this.editingAddonId, databasePayload).subscribe({
                next: () => {
                    this.alertService.success('Database Record Updated Successfully.');
                    this.onResetAddonForm();
                    this.refreshAddonGridData();
                },
                error: (err) => this.alertService.error('Backend rejected data update request.')
            });
        } else {
            this.foodService.createMenuItem(databasePayload).subscribe({
                next: () => {
                    this.alertService.success('Add-On written to remote database successfully.');
                    this.onResetAddonForm();
                    this.refreshAddonGridData(); 
                },
                error: (err) => this.alertService.error('Database insertion transaction failed.')
            });
        }
    }
   //

    onAddonGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        if (this.gridRowData.length > 0) {
            this.gridApi.setGridOption('rowData', this.gridRowData);
        }
    }

    onResetAddonForm(): void {
        this.editingAddonId = null;
        this.addonCreationForm.reset({ isActive: true });
    }

        onGridCellClicked(event: any): void {
        if (!event.event || !event.event.target) return;
        const target = event.event.target as HTMLElement;
        const action = target.getAttribute('data-action');

        if (action === 'edit') {
            this.editingAddonId = event.data.id;
            this.addonCreationForm.patchValue({
                name: event.data.name,
                price: event.data.price,
                categoryId: event.data.categoryId,
                isActive: event.data.isActive ?? true
            });
            this.alertService.success(`Loaded database record for: "${event.data.name}"`);
        }

        if (action === 'delete') {
            if (confirm(`Delete database entry for: "${event.data.name}"?`)) {
                this.foodService.deleteMenuItem(event.data.id).subscribe({
                    next: () => {
                        this.alertService.success('Record dropped from remote table data rows.');
                        if (this.editingAddonId === event.data.id) this.onResetAddonForm();
                        this.refreshAddonGridData();
                    },
                    error: () => this.alertService.error('Database rejected deletion query request.')
                });
            }
        }
    }
}