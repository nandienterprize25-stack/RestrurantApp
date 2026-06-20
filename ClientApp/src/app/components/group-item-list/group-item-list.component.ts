import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FoodManagementService } from '../../services/food-management.service';
import { MenuItem, Category } from '../../models/food-management.models';
import { CustomAlertService } from '../../services/custom-alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

@Component({
    selector: 'app-group-item-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
    templateUrl: './group-item-list.component.html'
})
export class GroupItemListComponent implements OnInit {
    private gridApi!: GridApi;
    
    groupComboForm!: FormGroup;
    categoriesList: Category[] = [];
    standaloneItemsList: MenuItem[] = [];
    gridRowData: any[] = [];

    // Configuration Definitions for the Combo List Page Grid
    gridColumnDefinitions: ColDef[] = [
        { headerName: 'Combo Identity Name', field: 'name', sortable: true, filter: true, flex: 2, cellStyle: { fontWeight: '700', color: '#0f172a' } },
        { headerName: 'Kitchen Ward', field: 'kitchenName', sortable: true, filter: true, flex: 1 },
        { headerName: 'Prep Speed', field: 'cookingTime', valueFormatter: p => p.value + ' Mins', sortable: true, flex: 1 },
        { headerName: 'Base Rate', field: 'price', valueFormatter: p => '$' + p.value, sortable: true, flex: 1, cellStyle: { color: '#16a34a', fontWeight: '700' } },
        { headerName: 'Visibility Status', field: 'isActive', flex: 1, cellRenderer: (p: any) => p.value ? '🟢 Active' : '🔴 Hidden' },
        {
            headerName: 'Danger Action Zone',
            field: 'id',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: () => {
                return `<button class="action-btn delete-btn" data-action="delete" style="padding: 6px 12px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 4px; font-size: 11px; cursor: pointer; color: #dc2626; font-weight: 700;">🗑️ Delete Platter</button>`;
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
        this.loadSavedComboGridRows(); // Populate our listing ledger right on startup!
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
            typeCoffee: [false],
            typeParty: [false],
            offer: [false],
            special: [false],
            isActive: [true],
            notes: [''],
            image: [''],
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
            this.alertService.error('Combo menu packages require at least one base ingredient track row.');
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

    // LIST LOADER METHOD: Hits your controller GET method to fetch and refresh rows live
    loadSavedComboGridRows(): void {
        this.foodService.getMenuItems(true).subscribe({
            next: (items: any[]) => {
                this.gridRowData = items.filter(x => x.isGroupItem === true);
            },
            error: () => this.alertService.error('Could not load current food combo items ledger table.')
        });
    }

    onComboGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    onResetFormLayout(): void {
        this.groupComboForm.reset({ kitchenName: 'Main Kitchen', cookingTime: 15, vatPercentage: 0, isActive: true });
        while (this.componentsArray.length !== 0) this.componentsArray.removeAt(0);
        this.addComponentRow();
    }

    onSubmitComboForm(): void {
    if (this.groupComboForm.invalid) {
        this.alertService.error('Please complete all required fields correctly before saving.');
        return;
    }

    const vals = this.groupComboForm.value;

    // Build the exact payload shape expected by CreateMenuItemDto in C#
    const productionPayload = {
        name: vals.name,
        categoryId: vals.categoryId,
        price: vals.price,
        vatPercentage: vals.vatPercentage || 0,
        kitchenName: vals.kitchenName,
        cookingTime: vals.cookingTime || 15,
        isGroupItem: true,       // Critical trigger to process linked components on backend
        isActive: vals.isActive ?? true,
        isSpecial: vals.special ?? false,
        hasOffer: vals.offer ?? false,
        notes: vals.notes || '',
        image: vals.image || 'assets/images/menu/bbq-family-deal.jpg',
        
        // 1. Map dynamic food selections safely to backend entity layout fields
        groupComponents: vals.components.map((comp: any) => ({
            childMenuItemId: comp.childMenuItemId,
            quantity: comp.quantity || 1
        })),

        // 2. REQUIRED FALLBACK: Create default operational time windows 
        availabilities: [
            {
                availableFrom: "00:00:00",
                availableTo: "23:59:59",
                isAvailableAllDay: true
            }
        ],

        // 3. REQUIRED FALLBACK: Provide an empty variations array block 
        variants: []
    };

    console.log('Sending Clean validated Payload to API:', productionPayload);

    // Dispatch directly to your established HTTP endpoint pipeline
    this.foodService.createMenuItem(productionPayload).subscribe({
        next: (response) => {
            this.alertService.success('Group Food Combo Product saved successfully!');
            this.onResetFormLayout();
            
            // Refresh your inventory list table if your component includes it
            if (typeof this['loadSavedComboGridRows'] === 'function') {
                this['loadSavedComboGridRows']();
            }
        },
        error: (err) => {
            console.error('Server Validation Error Details:', err);
            const backendMessage = err.error?.message || 'The server rejected the payload configuration setup maps.';
            this.alertService.error(`Failed to Save: ${backendMessage}`);
        }
    });
}

    onGridCellClicked(event: any): void {
        if (!event.event || !event.event.target) return;
        const target = event.event.target as HTMLElement;
        const action = target.getAttribute('data-action');

        if (action === 'delete') {
            if (confirm(`Completely wipe out "${event.data.name}" package listing?`)) {
                this.foodService.deleteMenuItem(event.data.id).subscribe({
                    next: () => {
                        this.alertService.success('Record drop sequence confirmed.');
                        this.loadSavedComboGridRows(); // Instantly update the spreadsheet view!
                    },
                    error: () => this.alertService.error('Failed to invoke endpoint deletion pipeline.')
                });
            }
        }
    }
}