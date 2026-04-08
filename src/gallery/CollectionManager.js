/**
 * Collection Manager - Auto-discovery system for JSON collections
 * Scans collections/ folder for JSON files and loads them automatically
 */
export class CollectionManager {
    constructor() {
        this.collections = new Map();
        this.baseCollectionPath = './collections/';
        this.loadingPromises = new Map();
    }
    
    /**
     * Auto-discover and load all JSON collections from collections/ folder
     */
    async autoDiscoverCollections() {
        console.log('🔍 Auto-discovering collections...');
        
        // List of known collection files to try loading
        const knownCollections = [
            'base-variations.json',
            'community-favorites.json',
            'dual-geometry-experiments.json',
            'holographic-gemstones.json',
            'special-variations.json',
            'geometric-dreams.json',
            'experimental-forms.json',
            'paul-custom-pack.json',
            'custom-variations.json'
        ];
        
        const loadPromises = knownCollections.map(filename => 
            this.loadCollection(filename).catch(err => {
                // Silently fail for missing files
                console.log(`📁 Collection not found: ${filename}`);
                return null;
            })
        );
        
        // Also try to load any user-custom files with date pattern
        const datePattern = /user-custom-\d{4}-\d{2}-\d{2}\.json$/;
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const filename = `user-custom-${dateStr}.json`;
            loadPromises.push(
                this.loadCollection(filename).catch(() => null)
            );
        }
        
        const results = await Promise.allSettled(loadPromises);
        const loadedCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Auto-discovery complete: ${loadedCount} collections loaded`);
        return Array.from(this.collections.values());
    }
    
    /**
     * Load a specific collection from the collections/ folder
     */
    async loadCollection(filename) {
        const fullPath = this.baseCollectionPath + filename;
        
        // Avoid duplicate loading
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }
        
        const loadPromise = this.fetchCollectionFile(fullPath, filename);
        this.loadingPromises.set(filename, loadPromise);
        
        try {
            const collection = await loadPromise;
            this.collections.set(filename, collection);
            console.log(`📋 Loaded collection: ${collection.name} (${collection.variations.length} variations)`);
            return collection;
        } catch (error) {
            console.warn(`❌ Failed to load collection ${filename}:`, error.message);
            this.loadingPromises.delete(filename);
            throw error;
        }
    }
    
    /**
     * Fetch and parse a collection file
     */
    async fetchCollectionFile(fullPath, filename) {
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate collection format
        if (!data.type || data.type !== 'holographic-collection') {
            throw new Error('Invalid collection format: missing type');
        }
        
        if (!data.variations || !Array.isArray(data.variations)) {
            throw new Error('Invalid collection format: missing variations array');
        }
        
        // Add metadata
        data.filename = filename;
        data.loadedAt = new Date().toISOString();
        
        return data;
    }
    
    /**
     * Get all loaded collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }
    
    /**
     * Get a specific collection by filename
     */
    getCollection(filename) {
        return this.collections.get(filename);
    }
    
    /**
     * Get all variations from all collections (flattened)
     */
    getAllVariations() {
        const allVariations = [];
        let currentId = 0;
        
        for (const collection of this.collections.values()) {
            for (const variation of collection.variations) {
                allVariations.push({
                    ...variation,
                    id: currentId++,
                    collectionName: collection.name,
                    collectionFilename: collection.filename,
                    isFromCollection: true
                });
            }
        }
        
        return allVariations;
    }
    
    /**
     * Save a new collection to the collections/ folder
     */
    async saveCollection(collection, filename) {
        // Validate filename
        if (!filename.endsWith('.json')) {
            filename += '.json';
        }
        
        // Ensure proper collection format
        const formattedCollection = {
            name: collection.name || 'Unnamed Collection',
            description: collection.description || '',
            version: '1.0',
            type: 'holographic-collection',
            profileName: collection.profileName || 'Active Holographic Systems',
            totalVariations: collection.variations.length,
            created: new Date().toISOString(),
            variations: collection.variations
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(formattedCollection, null, 2);
        
        // Create download (since we can't write directly to collections/)
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`💾 Collection saved: ${filename}`);
        console.log(`📁 To use: Move ${filename} to collections/ folder and refresh`);
        
        return formattedCollection;
    }
    
    /**
     * Create a collection from custom variations
     */
    createCustomCollection(customVariations, name) {
        const collection = {
            name: name || `Custom Collection ${new Date().toLocaleDateString()}`,
            description: 'User-created custom holographic variations',
            version: '1.0',
            type: 'holographic-collection',
            profileName: 'Active Holographic Systems',
            totalVariations: customVariations.length,
            created: new Date().toISOString(),
            variations: customVariations.map((cv, index) => ({
                id: index,
                name: cv.name || `Custom Variation ${index + 1}`,
                isCustom: true,
                parameters: {
                    geometryType: cv.params.geometry,
                    density: cv.params.density,
                    speed: cv.params.speed,
                    chaos: cv.params.chaos,
                    morph: cv.params.morph,
                    hue: cv.params.hue,
                    saturation: cv.params.saturation,
                    intensity: cv.params.intensity
                }
            }))
        };
        
        return collection;
    }
    
    /**
     * Get collection statistics
     */
    getStatistics() {
        const collections = Array.from(this.collections.values());
        let totalVariations = 0;
        let customCollections = 0;
        let baseCollections = 0;
        const collectionList = new Array(collections.length);

        for (let i = 0; i < collections.length; i++) {
            const c = collections[i];
            totalVariations += c.variations.length;

            const name = c.name || '';
            if (name.includes('Custom')) {
                customCollections++;
            }
            if (name.includes('Base')) {
                baseCollections++;
            }

            collectionList[i] = {
                name: c.name,
                filename: c.filename,
                variationCount: c.variations.length,
                created: c.created
            };
        }

        return {
            totalCollections: collections.length,
            totalVariations,
            customCollections,
            baseCollections,
            collections: collectionList
        };
    }
}