class PackageManager {
    constructor() {
        this.packages = [];
        this.categories = [];
        this.init();
    }

    async init() {
        await this.loadPackages();
        await this.loadCategories();
        this.setupEventListeners();
    }

    async loadPackages() {
        try {
            const response = await fetch('/admin/solutions/api/packages/');
            if (response.ok) {
                this.packages = await response.json();
                this.renderPackageSelect();
            }
        } catch (error) {
            console.error('Ошибка загрузки пакетов:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/admin/solutions/api/categories/');
            if (response.ok) {
                this.categories = await response.json();
                this.renderCategorySelect();
            }
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    renderPackageSelect() {
        const select = document.getElementById('packageSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Выберите пакет --</option>';

        this.packages.forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = pkg.name;
            option.dataset.price = pkg.price;
            option.dataset.days = pkg.delivery_days;
            option.dataset.features = JSON.stringify(pkg.features || []);
            select.appendChild(option);
        });
    }

    renderCategorySelect() {
        const select = document.querySelector('[name="category"]');
        if (!select) return;

        const selectedValue = select.value;

        const packageCategories = this.categories.filter(cat => cat.category_type === 'package');

        let html = '<option value="">-- Выберите категорию --</option>';
        packageCategories.forEach(cat => {
            html += `<option value="${cat.id}" ${selectedValue == cat.id ? 'selected' : ''}>${cat.name}</option>`;
        });

        select.innerHTML = html;
    }

    setupEventListeners() {
        const packageSelect = document.getElementById('packageSelect');
        if (packageSelect) {
            packageSelect.addEventListener('change', (e) => {
                this.fillSolutionData(e.target.value);
            });
        }

        const solutionType = document.querySelector('[name="solution_type"]');
        if (solutionType) {
            solutionType.addEventListener('change', (e) => {
                this.toggleSolutionFields(e.target.value);
            });
        }
    }

    fillSolutionData(packageId) {
        const pkg = this.packages.find(p => p.id == packageId);
        if (!pkg) return;

        const nameField = document.querySelector('[name="name"]');
        const priceField = document.querySelector('[name="price"]');
        const daysField = document.querySelector('[name="delivery_days"]');
        const categoryField = document.querySelector('[name="category"]');
        const featuresField = document.querySelector('[name="features_text"]');

        if (nameField) nameField.value = pkg.name;
        if (priceField) priceField.value = pkg.price;
        if (daysField) daysField.value = pkg.delivery_days;
        if (categoryField) categoryField.value = pkg.category_id;
        if (featuresField && pkg.features) {
            featuresField.value = pkg.features.join('\n');
        }

        if (nameField) {
            const slugField = document.querySelector('[name="slug"]');
            if (slugField && !slugField.value) {
                slugField.value = this.generateSlug(pkg.name);
            }
        }
    }

    toggleSolutionFields(solutionType) {
        const packageGroup = document.getElementById('packageSelectGroup');
        const customGroup = document.getElementById('customNameGroup');

        if (packageGroup) packageGroup.style.display = solutionType === 'package' ? 'block' : 'none';
        if (customGroup) customGroup.style.display = solutionType === 'module' ? 'block' : 'none';

        const categorySelect = document.querySelector('[name="category"]');
        if (categorySelect) {
            const moduleCategories = this.categories.filter(cat => cat.category_type === 'module');
            const packageCategories = this.categories.filter(cat => cat.category_type === 'package');

            let html = '<option value="">-- Выберите категорию --</option>';

            if (solutionType === 'package') {
                packageCategories.forEach(cat => {
                    html += `<option value="${cat.id}">${cat.name}</option>`;
                });
            } else if (solutionType === 'module') {
                moduleCategories.forEach(cat => {
                    html += `<option value="${cat.id}">${cat.name}</option>`;
                });
            }

            categorySelect.innerHTML = html;
        }
    }

    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    async createPackage(data) {
        try {
            const response = await fetch('/admin/solutions/api/packages/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const newPkg = await response.json();
                this.packages.push(newPkg);
                this.renderPackageSelect();
                return newPkg;
            } else {
                throw new Error('Ошибка создания пакета');
            }
        } catch (error) {
            console.error('Ошибка создания пакета:', error);
            throw error;
        }
    }

    async updatePackage(id, data) {
        try {
            const response = await fetch(`/admin/solutions/api/packages/${id}/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const updatedPkg = await response.json();
                const index = this.packages.findIndex(p => p.id == id);
                if (index !== -1) {
                    this.packages[index] = updatedPkg;
                }
                this.renderPackageSelect();
                return updatedPkg;
            } else {
                throw new Error('Ошибка обновления пакета');
            }
        } catch (error) {
            console.error('Ошибка обновления пакета:', error);
            throw error;
        }
    }

    async deletePackage(id) {
        try {
            const response = await fetch(`/admin/solutions/api/packages/${id}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            if (response.ok) {
                this.packages = this.packages.filter(p => p.id != id);
                this.renderPackageSelect();
                return true;
            } else {
                throw new Error('Ошибка удаления пакета');
            }
        } catch (error) {
            console.error('Ошибка удаления пакета:', error);
            throw error;
        }
    }

    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }
}

window.packageManager = new PackageManager();