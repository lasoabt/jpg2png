class ImageConverter {
    constructor() {
        this.selectedFiles = [];
        this.convertedFiles = [];
        this.activeTab = 'jpg-to-png';
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Tab elements
        this.jpgToPngTab = document.getElementById('jpgToPngTab');
        this.pngToJpgTab = document.getElementById('pngToJpgTab');
        
        // JPG to PNG elements
        this.uploadAreaJpg = document.getElementById('uploadAreaJpg');
        this.fileInputJpg = document.getElementById('fileInputJpg');
        this.uploadBtnJpg = document.getElementById('uploadBtnJpg');
        this.selectedFilesJpg = document.getElementById('selectedFilesJpg');
        this.filesGridJpg = document.getElementById('filesGridJpg');
        
        // PNG to JPG elements
        this.uploadAreaPng = document.getElementById('uploadAreaPng');
        this.fileInputPng = document.getElementById('fileInputPng');
        this.uploadBtnPng = document.getElementById('uploadBtnPng');
        this.selectedFilesPng = document.getElementById('selectedFilesPng');
        this.filesGridPng = document.getElementById('filesGridPng');
        
        // Common elements
        this.conversionOptions = document.getElementById('conversionOptions');
        this.convertBtn = document.getElementById('convertBtn');
        this.qualitySelector = document.getElementById('qualitySelector');
        this.qualitySlider = document.getElementById('quality');
        this.qualityValue = document.getElementById('qualityValue');
        this.progress = document.getElementById('progress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.results = document.getElementById('results');
        this.resultsList = document.getElementById('resultsList');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
    }

    attachEventListeners() {
        // Tab switching
        this.jpgToPngTab.addEventListener('click', () => this.switchTab('jpg-to-png'));
        this.pngToJpgTab.addEventListener('click', () => this.switchTab('png-to-jpg'));
        
        // JPG to PNG file upload events
        this.uploadBtnJpg.addEventListener('click', () => this.fileInputJpg.click());
        this.fileInputJpg.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        this.uploadAreaJpg.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadAreaJpg.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadAreaJpg.addEventListener('drop', (e) => this.handleDrop(e));
        
        // PNG to JPG file upload events
        this.uploadBtnPng.addEventListener('click', () => this.fileInputPng.click());
        this.fileInputPng.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        this.uploadAreaPng.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadAreaPng.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadAreaPng.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value + '%';
        });
        
        // Convert button
        this.convertBtn.addEventListener('click', () => this.convertImages());
        
        // Download all button
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllAsZip());
    }

    switchTab(tabName) {
        // Reset files when switching tabs
        this.resetCurrentTab();
        
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (tabName === 'jpg-to-png') {
            this.jpgToPngTab.classList.add('active');
            document.getElementById('jpg-to-png').classList.add('active');
        } else {
            this.pngToJpgTab.classList.add('active');
            document.getElementById('png-to-jpg').classList.add('active');
        }
        
        // Show/hide quality selector based on tab
        if (tabName === 'png-to-jpg') {
            this.qualitySelector.style.display = 'block';
        } else {
            this.qualitySelector.style.display = 'none';
        }
    }

    resetCurrentTab() {
        // Clean up object URLs
        this.selectedFiles.forEach((file, index) => {
            const grid = this.activeTab === 'jpg-to-png' ? this.filesGridJpg : this.filesGridPng;
            const img = grid.children[index]?.querySelector('.file-thumbnail');
            if (img?.src) {
                URL.revokeObjectURL(img.src);
            }
        });
        
        this.selectedFiles = [];
        this.selectedFilesJpg.style.display = 'none';
        this.selectedFilesPng.style.display = 'none';
        this.conversionOptions.style.display = 'none';
        this.results.style.display = 'none';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        this.handleFileSelect(e.dataTransfer.files);
    }

    handleFileSelect(files) {
        const validFiles = Array.from(files).filter(file => {
            let isValidType = false;
            
            // Check file type based on active tab
            if (this.activeTab === 'jpg-to-png') {
                isValidType = file.type === 'image/jpeg' || file.type === 'image/jpg';
                if (!isValidType) {
                    alert(`${file.name} is not a valid JPG/JPEG file. Please select only JPG or JPEG images.`);
                    return false;
                }
            } else {
                isValidType = file.type === 'image/png';
                if (!isValidType) {
                    alert(`${file.name} is not a valid PNG file. Please select only PNG images.`);
                    return false;
                }
            }
            
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
            if (!isValidSize) {
                alert(`${file.name} is too large. Please use files under 10MB.`);
                return false;
            }
            
            return true;
        });

        if (validFiles.length > 0) {
            // Add new files to existing selection
            this.selectedFiles = [...this.selectedFiles, ...validFiles];
            this.updateFilePreview();
            this.showConversionOptions();
        }
    }

    updateFilePreview() {
        const selectedFilesSection = this.activeTab === 'jpg-to-png' ? this.selectedFilesJpg : this.selectedFilesPng;
        const filesGrid = this.activeTab === 'jpg-to-png' ? this.filesGridJpg : this.filesGridPng;
        
        if (this.selectedFiles.length === 0) {
            selectedFilesSection.style.display = 'none';
            return;
        }

        selectedFilesSection.style.display = 'block';
        filesGrid.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const img = document.createElement('img');
            img.className = 'file-thumbnail';
            img.src = URL.createObjectURL(file);
            img.alt = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removeFile(index);

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;

            fileItem.appendChild(img);
            fileItem.appendChild(removeBtn);
            fileItem.appendChild(fileName);
            filesGrid.appendChild(fileItem);
        });
    }

    removeFile(index) {
        const filesGrid = this.activeTab === 'jpg-to-png' ? this.filesGridJpg : this.filesGridPng;
        
        // Clean up the object URL before removing
        if (this.selectedFiles[index]) {
            const img = filesGrid.children[index]?.querySelector('.file-thumbnail');
            if (img?.src) {
                URL.revokeObjectURL(img.src);
            }
        }
        
        this.selectedFiles.splice(index, 1);
        this.updateFilePreview();
        
        if (this.selectedFiles.length === 0) {
            this.conversionOptions.style.display = 'none';
        }
    }

    showConversionOptions() {
        this.conversionOptions.style.display = 'block';
    }

    handleFormatChange(format) {
        if (format === 'jpg') {
            this.qualitySelector.style.display = 'block';
        } else {
            this.qualitySelector.style.display = 'none';
        }
    }

    async convertImages() {
        const targetFormat = this.activeTab === 'jpg-to-png' ? 'png' : 'jpg';
        const quality = parseInt(this.qualitySlider.value) / 100;
        
        this.showProgress();
        this.convertedFiles = [];
        
        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            this.updateProgress((i / this.selectedFiles.length) * 100, `Converting ${file.name}...`);
            
            try {
                const convertedFile = await this.convertSingleImage(file, targetFormat, quality);
                this.convertedFiles.push(convertedFile);
            } catch (error) {
                console.error(`Error converting ${file.name}:`, error);
                alert(`Failed to convert ${file.name}. Please try again.`);
            }
        }
        
        this.updateProgress(100, 'Conversion complete!');
        setTimeout(() => {
            this.hideProgress();
            this.showResults();
        }, 500);
    }

    async convertSingleImage(file, targetFormat, quality = 0.9) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // If converting to JPG, fill background with white to handle transparency
                if (targetFormat === 'jpg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const originalExtension = file.name.split('.').pop().toLowerCase();
                        const newExtension = targetFormat === 'jpg' ? 'jpg' : 'png';
                        const newFileName = file.name.replace(new RegExp(`\\.${originalExtension}$`, 'i'), `.${newExtension}`);
                        
                        resolve({
                            blob: blob,
                            name: newFileName,
                            originalName: file.name,
                            size: blob.size,
                            url: URL.createObjectURL(blob)
                        });
                    } else {
                        reject(new Error('Failed to convert image'));
                    }
                }, targetFormat === 'jpg' ? 'image/jpeg' : 'image/png', quality);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    showProgress() {
        this.progress.style.display = 'block';
        this.conversionOptions.style.display = 'none';
    }

    hideProgress() {
        this.progress.style.display = 'none';
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = text;
    }

    showResults() {
        this.resultsList.innerHTML = '';
        
        this.convertedFiles.forEach((file, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="result-info">
                    <img src="${file.url}" alt="Preview" class="result-preview">
                    <div class="result-details">
                        <h4>${file.name}</h4>
                        <p>Size: ${this.formatFileSize(file.size)} | Original: ${file.originalName}</p>
                    </div>
                </div>
                <button class="download-btn" onclick="imageConverter.downloadSingle(${index})">
                    Download
                </button>
            `;
            
            this.resultsList.appendChild(resultItem);
        });
        
        this.results.style.display = 'block';
        
        if (this.convertedFiles.length > 1) {
            this.downloadAllBtn.style.display = 'block';
        }
    }

    downloadSingle(index) {
        const file = this.convertedFiles[index];
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async downloadAllAsZip() {
        if (this.convertedFiles.length === 1) {
            this.downloadSingle(0);
            return;
        }
        
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            console.error('JSZip library not loaded');
            alert('ZIP functionality not available. Files will be downloaded individually.');
            this.downloadIndividually();
            return;
        }
        
        try {
            // Create a new JSZip instance
            const zip = new JSZip();
            
            // Add each converted file to the ZIP
            for (const file of this.convertedFiles) {
                // Convert blob to array buffer for JSZip
                const arrayBuffer = await file.blob.arrayBuffer();
                zip.file(file.name, arrayBuffer);
            }
            
            // Generate the ZIP file
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            
            // Create download link for the ZIP
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'converted-images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the ZIP blob URL
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            alert('Failed to create ZIP file: ' + error.message + '. Files will be downloaded individually.');
            this.downloadIndividually();
        }
    }

    downloadIndividually() {
        // Fallback to individual downloads
        for (let i = 0; i < this.convertedFiles.length; i++) {
            setTimeout(() => {
                this.downloadSingle(i);
            }, i * 200); // Slightly longer delay
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    reset() {
        // Clean up object URLs from selected files
        this.selectedFiles.forEach((file, index) => {
            const img = this.filesGrid.children[index]?.querySelector('.file-thumbnail');
            if (img?.src) {
                URL.revokeObjectURL(img.src);
            }
        });

        this.selectedFiles = [];
        this.convertedFiles = [];
        this.selectedFilesSection.style.display = 'none';
        this.conversionOptions.style.display = 'none';
        this.results.style.display = 'none';
        this.progress.style.display = 'none';
        this.downloadAllBtn.style.display = 'none';
        
        // Reset upload area
        this.resetUploadArea();
        
        // Clear file input
        this.fileInput.value = '';
        
        // Clean up object URLs from converted files
        this.convertedFiles.forEach(file => {
            if (file.url) {
                URL.revokeObjectURL(file.url);
            }
        });
    }
}

// Initialize the converter when the page loads
let imageConverter;
document.addEventListener('DOMContentLoaded', () => {
    imageConverter = new ImageConverter();
});

// Add a reset button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add reset functionality when clicking on the upload area after conversion
    const uploadArea = document.getElementById('uploadArea');
    let isConverted = false;
    
    const originalConvertImages = ImageConverter.prototype.convertImages;
    ImageConverter.prototype.convertImages = function() {
        originalConvertImages.call(this);
        isConverted = true;
        
        // Add click-to-reset functionality
        uploadArea.style.cursor = 'pointer';
        uploadArea.title = 'Click to convert new images';
    };
    
    uploadArea.addEventListener('click', (e) => {
        if (isConverted && !e.target.closest('#uploadBtn')) {
            if (confirm('Do you want to convert new images? This will reset the current results.')) {
                imageConverter.reset();
                isConverted = false;
                uploadArea.style.cursor = 'default';
                uploadArea.title = '';
            }
        }
    });
});