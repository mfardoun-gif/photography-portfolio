document.addEventListener('DOMContentLoaded', () => {
    let portfolioData = null;

    const navArt = document.getElementById('art-link');
    const seriesMenu = document.getElementById('series-menu');
    const navAbout = document.getElementById('about-link');
    const navBrand = document.getElementById('home-link');

    const navCollect = document.getElementById('collect-link');

    const heroSec = document.getElementById('hero-section');
    const gallerySec = document.getElementById('gallery-section');
    const aboutSec = document.getElementById('about-section');
    const collectGridSec = document.getElementById('collect-grid-section');
    const artworkDetailSec = document.getElementById('artwork-detail-section');
    
    const galleryTitle = document.getElementById('gallery-title');
    const galleryGrid = document.getElementById('gallery-grid');
    const collectGrid = document.getElementById('collect-grid');

    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');

    // Parse RAW_COPY_TEXT from editable-copy.js
    let parsedBio = "";
    let parsedMetadata = {};
    let parsedCollectImages = [];

    // Check for the RAW_COPY_TEXT variable
    const sourceText = (typeof RAW_COPY_TEXT !== 'undefined') ? RAW_COPY_TEXT : "";
    
    if (sourceText) {
        // Robust regex for sections
        const extractSection = (title) => {
            const regex = new RegExp(`--- ${title} ---\\s*([\\s\\S]*?)(?=\\n*--- |$)`);
            const match = sourceText.match(regex);
            return match ? match[1].trim() : "";
        };

        parsedBio = extractSection("SITE BIO").replace(/\n\n/g, '<br><br>');
        
        const rawOptions = extractSection("PRINT OPTIONS");
        let parsedOptions = ["Material Print", "Canvas", "Metal"];
        if (rawOptions) {
            parsedOptions = rawOptions.split('\n').map(opt => opt.trim()).filter(opt => opt !== "");
        }

        // Render Print Options
        const optionsContainer = document.getElementById('artsy-buy-options');
        if (optionsContainer && parsedOptions.length > 0) {
            optionsContainer.innerHTML = '';
            parsedOptions.forEach((optText, index) => {
                const label = document.createElement('label');
                label.className = 'artsy-option' + (index === 0 ? ' active' : '');
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'printType';
                input.value = optText;
                if (index === 0) input.checked = true;
                
                const span = document.createElement('span');
                span.className = 'option-title';
                span.textContent = optText;
                
                label.appendChild(input);
                label.appendChild(span);
                
                label.onclick = () => {
                    document.querySelectorAll('.artsy-option').forEach(o => o.classList.remove('active'));
                    label.classList.add('active');
                    input.checked = true;
                };
                
                optionsContainer.appendChild(label);
            });
        }

        const artBlocks = sourceText.split(/\[Artwork:\s*(.*?)\]/g);
        for (let i = 1; i < artBlocks.length; i += 2) {
            const filename = artBlocks[i].trim();
            const id = filename.split('.').slice(0, -1).join('.'); // ID without extension
            parsedCollectImages.push(filename);
            
            const rawMeta = artBlocks[i+1].trim();
            const metaObj = {};
            rawMeta.split('\n').forEach(line => {
                const colonIdx = line.indexOf(':');
                if (colonIdx > -1) {
                    const key = line.substring(0, colonIdx).trim().toLowerCase();
                    const val = line.substring(colonIdx + 1).trim();
                    metaObj[key] = val;
                }
            });
            parsedMetadata[id] = metaObj;
        }

        // Apply Bio
        const aboutBio = document.getElementById('about-bio-text');
        const artsyBio = document.getElementById('artsy-bio-text');
        if (aboutBio) aboutBio.innerHTML = parsedBio;
        if (artsyBio) artsyBio.innerHTML = parsedBio;
    }

    // Use global variable from portfolioData.js
    if (typeof windowPortfolioData !== 'undefined') {
        const data = windowPortfolioData;
        
        // Dynamically override collect images from the editable text source of truth!
        if (parsedCollectImages.length > 0) {
            data.collect = [{
                path: "collect/",
                images: parsedCollectImages
            }];
        }
        
        portfolioData = data;
        initNav(data.series);
        
        // Set Hero to a random image from the first series
        if(data.series.length > 0 && data.series[0].images.length > 0) {
            const s = data.series[0];
            heroImage.src = s.path + s.images[0];
            heroTitle.textContent = `PROJECTS / ${s.name.toUpperCase()}`;
        }
    } else {
        console.error("Error loading portfolio data: windowPortfolioData is not defined.");
    }

    function initNav(seriesList) {
        seriesMenu.innerHTML = '';
        seriesList.forEach(series => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = series.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showGallery(series);
            });
            seriesMenu.appendChild(link);
        });
    }

    // Navigation Logic
    function hideAllSections() {
        heroSec.classList.add('hidden');
        heroSec.classList.remove('active');
        gallerySec.classList.add('hidden');
        gallerySec.classList.remove('active');
        aboutSec.classList.add('hidden');
        aboutSec.classList.remove('active');
        collectGridSec.classList.add('hidden');
        collectGridSec.classList.remove('active');
        artworkDetailSec.classList.add('hidden');
        artworkDetailSec.classList.remove('active');
    }

    navBrand.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        heroSec.classList.remove('hidden');
        heroSec.classList.add('active');
    });

    navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        aboutSec.classList.remove('hidden');
        aboutSec.classList.add('active');
    });

    function showGallery(series) {
        hideAllSections();
        galleryTitle.textContent = series.name;
        galleryGrid.innerHTML = '';

        series.images.forEach(imgName => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = series.path + imgName;
            img.alt = `${series.name} - ${imgName}`;
            img.loading = 'lazy'; // crucial for performance
            
            item.appendChild(img);
            galleryGrid.appendChild(item);
        });

        gallerySec.classList.remove('hidden');
        gallerySec.classList.add('active');
    }

    navCollect.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        
        collectGrid.innerHTML = '';
        if (portfolioData && portfolioData.collect && portfolioData.collect.length > 0) {
            const col = portfolioData.collect[0];
            col.images.forEach(imgName => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const img = document.createElement('img');
                const fullPath = col.path + imgName;
                img.src = fullPath;
                img.alt = `Collectable artwork`;
                img.loading = 'lazy';
                
                // Add click listener to show artsy detail view
                item.addEventListener('click', () => {
                    showArtworkDetail(imgName, fullPath);
                });
                
                item.appendChild(img);
                collectGrid.appendChild(item);
            });
        }
        
        collectGridSec.classList.remove('hidden');
        collectGridSec.classList.add('active');
    });

    document.getElementById('back-to-collect').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        collectGridSec.classList.remove('hidden');
        collectGridSec.classList.add('active');
    });

    function showArtworkDetail(filename, imagePath) {
        hideAllSections();
        
        // Strip out the extension to match Metadata ID
        const id = filename.split('.').slice(0, -1).join('.');
        
        document.getElementById('artsy-image').src = imagePath;
        
        let meta = {
            title: "Unknown Artwork",
            year: "Unknown",
            materials: "N/A",
            size: "N/A",
            rarity: "N/A",
            medium: "N/A",
            condition: "N/A",
            signature: "N/A",
            frame: "N/A",
            about: "No details available.",
            provenance: "No details available."
        };

        if (parsedMetadata[id]) {
            meta = { ...meta, ...parsedMetadata[id] };
        }
        
        // Build title + year display — fallback to filename if title is empty
        const displayTitle = meta.title && meta.title.trim() !== '' ? meta.title : id;
        const titleYearEl = document.getElementById('artsy-title-year');
        titleYearEl.innerHTML = `<em>${displayTitle}</em>${meta.year && meta.year !== 'Unknown' ? `, <span>${meta.year}</span>` : ''}`;
        
        // Combine medium and size for the summary below title
        document.getElementById('artsy-summary-medium').textContent = `${meta.medium}, ${meta.size}`;
        
        // Setup Contact Email Links
        const igLink = `https://www.instagram.com/mayafardoun?igsh=MXhhdXVhdXNrNnUxOA%3D%3D&utm_source=qr`;
        document.getElementById('contact-primary-btn').onclick = () => window.open(igLink, '_blank');
        document.getElementById('contact-studio-btn').onclick = () => window.open(igLink, '_blank');
        
        // Set metadata rows
        document.getElementById('artsy-materials').textContent = meta.materials;
        document.getElementById('artsy-size').textContent = meta.size;
        document.getElementById('artsy-rarity').textContent = meta.rarity;
        document.getElementById('artsy-medium').textContent = meta.medium;
        document.getElementById('artsy-condition').textContent = meta.condition;
        document.getElementById('artsy-signature').textContent = meta.signature;
        document.getElementById('artsy-frame').textContent = meta.frame;

        artworkDetailSec.classList.remove('hidden');
        artworkDetailSec.classList.add('active');
    }
});
