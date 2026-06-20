import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem, Category } from '../../models/food-management.models';
import { CustomAlertService } from '../../services/custom-alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

// 🔥 IMPORT AG-GRID MODULE REGISTER SYSTEM TO RESOLVE CONSOLE ERROR #200
import { 
    ModuleRegistry, 
    ClientSideRowModelModule, 
    TextFilterModule, 
    NumberFilterModule, 
    CellStyleModule,
    PaginationModule
} from 'ag-grid-community';

// Register all required modules before component initialization
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    CellStyleModule,
    PaginationModule
]);

@Component({
    selector: 'app-create-combo-item',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './create-combo-item.html'
})
export class CreateComboItemComponent implements OnInit {
    private gridApi!: GridApi;
    
    groupComboForm!: FormGroup;
    categoriesList: Category[] = [];
    standaloneItemsList: MenuItem[] = [];
    gridRowData: any[] = [];
    editingComboId: string | null = null; // Tracks item if in update mode

    gridColumnDefinitions: ColDef[] = [
        { headerName: 'Combo Platter Name', field: 'name', sortable: true, filter: 'agTextColumnFilter', flex: 2, cellStyle: { fontWeight: '700', color: '#0f172a' } },
        { headerName: 'Assigned Kitchen', field: 'kitchenName', sortable: true, filter: 'agTextColumnFilter', flex: 1 },
        { headerName: 'Base Rate', field: 'price', valueFormatter: p => '$' + p.value, sortable: true, filter: 'agNumberColumnFilter', flex: 1, cellStyle: { color: '#16a34a', fontWeight: '700' } },
        { headerName: 'Status', field: 'isActive', flex: 1, cellRenderer: (p: any) => p.value ? '🟢 Live' : '🔴 Hidden' },
       {
            headerName: 'Control Actions Panel',
            field: 'id',
            flex: 1.5, // slightly wider to accommodate both buttons comfortably
            sortable: false,
            filter: false,
            cellRenderer: (params: any) => {
                return `
                    <div style="display: flex; gap: 8px; align-items: center; height: 100%; margin-top: 6px;">
                        <button class="action-btn edit-btn" data-action="edit" style="padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 11px; cursor: pointer; color: #16a34a; font-weight: 700; height: 32px; display: inline-flex; align-items: center; justify-content: center;">✏️ Edit</button>
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
        this.buildReactiveCreationForm();
    }

    ngOnInit(): void {
        this.fetchFormDropdownDependencies();
        this.loadSavedComboGridRows();
        this.toggleAvailabilityFields();
    }

    private buildReactiveCreationForm(): void {
        this.groupComboForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            categoryId: ['', Validators.required],
            price: ['', [Validators.required, Validators.min(0)]],
            vatPercentage: [0, [Validators.min(0)]],
            kitchenName: ['Main Kitchen', Validators.required],
            cookingTime: [15, [Validators.min(1)]],
            
            // Fixed structural model configurations
            typeBreakfast: [false],
            typeLunch: [false],
            typeDinner: [false],
            
            isAvailableAllDay: [true],
            availableFrom: [{ value: '00:00', disabled: true }],
            availableTo: [{ value: '23:59', disabled: true }],
            
            components: this.fb.array([])
        });
        this.addComponentRow();
    }

    toggleAvailabilityFields(): void {
        const isAllDay = this.groupComboForm.get('isAvailableAllDay')?.value;
        const fromControl = this.groupComboForm.get('availableFrom');
        const toControl = this.groupComboForm.get('availableTo');

        if (isAllDay) {
            fromControl?.disable();
            toControl?.disable();
            fromControl?.setValue('00:00');
            toControl?.setValue('23:59');
        } else {
            fromControl?.enable();
            toControl?.enable();
            if (fromControl?.value === '00:00') fromControl?.setValue('08:00');
            if (toControl?.value === '23:59') toControl?.setValue('22:00');
        }
    }

    toggleMenuType(controlName: string): void {
        const control = this.groupComboForm.get(controlName);
        if (control) {
            control.setValue(!control.value);
            control.markAsDirty();
            control.updateValueAndValidity();
        }
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
        this.foodService.getCategories(true).subscribe({
            next: (cats) => {
                this.categoriesList = cats;
                console.log("Categories loaded successfully:", cats);
            },
            error: (err) => console.error("Failed to load menu categories:", err)
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
        this.editingComboId = null; // Reset edit tracking state back to null
        this.groupComboForm.reset({ 
            kitchenName: 'Main Kitchen', 
            cookingTime: 15, 
            vatPercentage: 0,
            isAvailableAllDay: true,
            typeBreakfast: false,
            typeLunch: false,
            typeDinner: false
        });
        this.toggleAvailabilityFields();
        while (this.componentsArray.length !== 0) this.componentsArray.removeAt(0);
        this.addComponentRow();
    }
    onSubmitComboForm(): void {
        if (this.groupComboForm.invalid) {
            this.alertService.error('Please complete all mandatory form configuration fields before saving.');
            return;
        }

        const vals = this.groupComboForm.getRawValue();
        
        const startTime = vals.availableFrom ? `${vals.availableFrom}:00` : "00:00:00";
        const endTime = vals.availableTo ? `${vals.availableTo}:00` : "23:59:00";

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
            
            // Passing the menu type assignments safely inside the transaction payload
            typeBreakfast: vals.typeBreakfast,
            typeLunch: vals.typeLunch,
            typeDinner: vals.typeDinner,
            
            availabilities: [{ 
                availableFrom: startTime, 
                availableTo: endTime, 
                isAvailableAllDay: vals.isAvailableAllDay 
            }],
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

        if (action === 'edit') {
            const item = event.data;
            this.editingComboId = item.id;

            // 1. Clear out any existing sub-item composition rows safely
            while (this.componentsArray.length !== 0) {
                this.componentsArray.removeAt(0);
            }

            // 2. Re-populate the sub-item matrix rows based on saved ingredients data
            if (item.groupComponents && item.groupComponents.length > 0) {
                item.groupComponents.forEach((comp: any) => {
                    this.componentsArray.push(this.fb.group({
                        childMenuItemId: [comp.childMenuItemId || '', Validators.required],
                        quantity: [comp.quantity || 1, [Validators.required, Validators.min(1)]]
                    }));
                });
            } else {
                this.addComponentRow(); // Fallback to 1 blank row if no components exist
            }

            // 3. Extract availability values safely
            const availability = item.availabilities?.[0] || { isAvailableAllDay: true, availableFrom: '00:00', availableTo: '23:59' };
            
            // Format time inputs down to "HH:MM" format so HTML inputs accept them
            const cleanFrom = availability.availableFrom ? availability.availableFrom.substring(0, 5) : '08:00';
            const cleanTo = availability.availableTo ? availability.availableTo.substring(0, 5) : '22:00';

            // 4. Load values into the form structure
            this.groupComboForm.patchValue({
                name: item.name,
                categoryId: item.categoryId,
                price: item.price,
                vatPercentage: item.vatPercentage || 0,
                kitchenName: item.kitchenName || 'Main Kitchen',
                cookingTime: item.cookingTime || 15,
                typeBreakfast: item.typeBreakfast || false,
                typeLunch: item.typeLunch || false,
                typeDinner: item.typeDinner || false,
                isAvailableAllDay: availability.isAvailableAllDay
            });

            // Set explicit times inside controls
            this.groupComboForm.get('availableFrom')?.setValue(cleanFrom);
            this.groupComboForm.get('availableTo')?.setValue(cleanTo);

            this.toggleAvailabilityFields();
            this.alertService.success(`Loaded "${item.name}" into editing workspace.`);
            
            // Scroll smoothly to form workspace top area
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (action === 'delete') {
            if (confirm(`Are you certain you want to purge the entity bundle listing: "${event.data.name}"?`)) {
                this.foodService.deleteMenuItem(event.data.id).subscribe({
                    next: () => {
                        this.alertService.success('Combo bundle entry completely dropped from data indexing tables.');
                        if (this.editingComboId === event.data.id) this.onResetFormLayout();
                        this.loadSavedComboGridRows();
                    },
                    error: () => this.alertService.error('Could not clean targets record row line nodes.')
                });
            }
        }
    }
}