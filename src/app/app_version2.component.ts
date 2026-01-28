import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  name: string;
  children?: Category[];
  expanded?: boolean;
}

interface Parameter {
  id: string;
  name: string;
  category: string;
  editable: boolean;
  tags: string[];
  description: string;
  value: any;
}

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [CommonModule, FormsModule],

  template: `
<div class="container">

  <h2>🚀 Guided Parameter Explorer</h2>

  <!-- Intent Badges -->
  <div class="badges">
    <span class="badge" (click)="applyIntent('performance')">⚡ Performance</span>
    <span class="badge" (click)="applyIntent('power')">🔋 Power</span>
    <span class="badge reset" (click)="resetFilters()">♻ Reset</span>
  </div>

  <!-- Search + Filters -->
  <div class="toolbar">
    <input
      placeholder="Search parameters..."
      [(ngModel)]="searchText"
      (input)="applyFilters()" />

    <label>
      <input type="checkbox" [(ngModel)]="editableOnly" (change)="applyFilters()" />
      Editable Only
    </label>
  </div>

  <!-- Breadcrumb -->
  <div class="breadcrumb">
    <span *ngFor="let b of breadcrumb; let last = last">
      {{b}} <span *ngIf="!last">›</span>
    </span>
  </div>

  <div class="layout">

    <!-- Tree Panel -->
    <div class="panel tree">
      <h4>📂 Categories</h4>

      <ul>
        <ng-container *ngFor="let c of categories">
          <li>
            <span class="node" (click)="toggle(c)">
              {{c.expanded ? '▼' : '▶'}} {{c.name}}
            </span>
            <ul *ngIf="c.expanded">
              <li *ngFor="let sub of c.children">
                <span class="leaf" (click)="selectCategory(c.name + '/' + sub.name)">
                  {{sub.name}}
                </span>
              </li>
            </ul>
          </li>
        </ng-container>
      </ul>
    </div>

    <!-- Parameter List -->
    <div class="panel">
      <h4>🧩 Parameters ({{filteredParams.length}})</h4>

      <!-- Bucket View -->
<div *ngIf="showBuckets" class="bucket-panel">
  <h5>Too many results. Refine further:</h5>

  <div
    class="bucket"
    *ngFor="let b of buckets"
    (click)="selectBucket(b.name)">
    {{b.name}} ({{b.count}})
  </div>
</div>

<!-- Parameter List -->
<div *ngIf="!showBuckets" class="viewport">
  <div
    *ngFor="let p of filteredParams"
    class="param-row"
    [class.readonly]="!p.editable"
    (click)="selectParam(p)"
    [title]="p.description">

    {{p.name}}
    <span class="lock" *ngIf="!p.editable">🔒</span>
  </div>
</div>



    <!-- Context Panel -->
    <div class="panel">
      <h4>📖 Context</h4>

      <div *ngIf="selectedParam; else empty">
        <h3>{{selectedParam.name}}</h3>
        <p>{{selectedParam.description}}</p>
        <p><b>Category:</b> {{selectedParam.category}}</p>
        <p><b>Editable:</b> {{selectedParam.editable}}</p>
        <p><b>Value:</b> {{selectedParam.value}}</p>
      </div>

      <ng-template #empty>
        <p>Select a parameter to view help.</p>
      </ng-template>
    </div>

  </div>
</div>
  `,
  styles: [
    `
.container { font-family: Arial; padding: 16px; }
.layout { display: flex; gap: 12px; height: 70vh; }
.panel { border: 1px solid #ccc; padding: 10px; flex: 1; overflow: auto; }
.tree { max-width: 250px; }

.viewport { height: calc(100% - 40px); overflow-y: auto; }

.param-row {
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.param-row:hover { background: #f5f5f5; }
.param-row.readonly { opacity: 0.6; }

.lock { float: right; }

.node { cursor: pointer; font-weight: bold; }
.leaf { cursor: pointer; margin-left: 16px; color: #1976d2; }

.toolbar { margin: 10px 0; display: flex; gap: 12px; }

.breadcrumb { font-size: 13px; margin-bottom: 6px; color: #555; }

.badges { margin-bottom: 8px; }
.badge {
  background: #1976d2;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  margin-right: 6px;
  cursor: pointer;
  font-size: 12px;
}
.bucket-panel { padding: 10px; }

.bucket {
  padding: 10px;
  margin-bottom: 8px;
  background: #f2f2f2;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.bucket:hover {
  background: #e0e0e0;
}

.badge.reset { background: #666; }

`,
  ],
})
export class AppComponent implements OnInit {
  searchText = '';
  editableOnly = false;

  breadcrumb: string[] = ['All'];

  categories: Category[] = [
    {
      name: 'Performance',
      expanded: true,
      children: [{ name: 'CPU' }, { name: 'Memory' }, { name: 'IO' }],
    },
    {
      name: 'Power',
      expanded: false,
      children: [{ name: 'Thermal' }],
    },
  ];

  parameters: Parameter[] = [];
  filteredParams: Parameter[] = [];
  selectedParam?: Parameter;
  selectedCategory = '';
  showBuckets = false;
  buckets: { name: string; count: number }[] = [];
  activeBucket = '';

  ngOnInit() {
    const cats = ['CPU', 'Memory', 'IO', 'Thermal'];

    const tagMap: Record<string, string[]> = {
      CPU: ['performance', 'latency'],
      Memory: ['performance', 'capacity'],
      IO: ['throughput', 'latency'],
      Thermal: ['power', 'safety'],
    };

    for (let i = 1; i <= 1200; i++) {
      const cat = cats[i % cats.length];

      this.parameters.push({
        id: `PARAM_${i}`,
        name: `Parameter ${i}`,
        category: cat,
        tags: tagMap[cat],
        editable: i % 8 === 0,
        value: Math.floor(Math.random() * 500),
        description: `Controls behavior of ${cat} subsystem (parameter ${i}).`,
      });
    }

    this.filteredParams = [...this.parameters];
  }

  toggle(cat: Category) {
    cat.expanded = !cat.expanded;
  }

  selectCategory(path: string) {
    this.selectedCategory = path.split('/').pop()!;
    this.breadcrumb = ['All', ...path.split('/')];
    this.applyFilters();
  }

  selectParam(p: Parameter) {
    this.selectedParam = p;
  }

  applyIntent(intent: string) {
    if (intent === 'performance') {
      this.selectedCategory = '';
      this.filteredParams = this.parameters.filter((p) =>
        ['CPU', 'Memory', 'IO'].includes(p.category)
      );
      this.breadcrumb = ['Intent', 'Performance'];
    }

    if (intent === 'power') {
      this.filteredParams = this.parameters.filter(
        (p) => p.category === 'Thermal'
      );
      this.breadcrumb = ['Intent', 'Power'];
    }

    this.applyFilters();
  }

  resetFilters() {
    this.searchText = '';
    this.editableOnly = false;
    this.selectedCategory = '';
    this.breadcrumb = ['All'];
    this.filteredParams = [...this.parameters];
  }

  applyFilters() {
    const result = this.parameters.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

      const matchesEditable = !this.editableOnly || p.editable;

      const matchesCategory =
        !this.selectedCategory || p.category === this.selectedCategory;

      const matchesBucket =
        !this.activeBucket || p.tags.includes(this.activeBucket.toLowerCase());

      return (
        matchesSearch && matchesEditable && matchesCategory && matchesBucket
      );
    });

    // 👉 If too many results, switch to bucket view
    if (result.length > 200) {
      this.showBuckets = true;
      this.createBuckets(result);
      this.filteredParams = [];
    } else {
      this.showBuckets = false;
      this.filteredParams = result;
    }
  }

  createBuckets(params: Parameter[]) {
    const map: Record<string, number> = {};

    params.forEach((p) => {
      p.tags.forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });

    this.buckets = Object.keys(map).map((tag) => ({
      name: tag.toUpperCase(),
      count: map[tag],
    }));
  }

  selectBucket(bucket: string) {
    this.activeBucket = bucket.toLowerCase();
    this.showBuckets = false;
    this.breadcrumb = ['All', 'Bucket', bucket];
    this.applyFilters();
  }
}
