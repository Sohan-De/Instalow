// Script pour remplacer les emojis par des icônes Font Awesome
// Utilisation: node replace-emojis.js

const fs = require('fs');
const path = require('path');

// Mapping des emojis vers les icônes Font Awesome
const emojiToIcon = {
    '👤': '<i class="fas fa-user"></i>',
    '📊': '<i class="fas fa-chart-line"></i>',
    '💳': '<i class="fas fa-credit-card"></i>',
    '🚪': '<i class="fas fa-sign-out-alt"></i>',
    '🔒': '<i class="fas fa-lock"></i>',
    '📧': '<i class="fas fa-envelope"></i>',
    '⚡': '<i class="fas fa-bolt"></i>',
    '🎯': '<i class="fas fa-bullseye"></i>',
    '🔗': '<i class="fas fa-link"></i>',
    '📱': '<i class="fas fa-mobile-alt"></i>',
    '🖥️': '<i class="fas fa-desktop"></i>',
    '🎮': '<i class="fas fa-gamepad"></i>',
    '🛡️': '<i class="fas fa-shield-alt"></i>',
    '→': '<i class="fas fa-arrow-right"></i>',
    '★': '<i class="fas fa-star"></i>',
    '🔍': '<i class="fab fa-google"></i>',
    '🐙': '<i class="fab fa-github"></i>',
    '✅': '<i class="fas fa-check"></i>',
    '📋': '<i class="fas fa-clipboard"></i>',
    '🚀': '<i class="fas fa-rocket"></i>',
    '⭐': '<i class="fas fa-star"></i>',
    '✨': '<i class="fas fa-sparkles"></i>',
    '🌟': '<i class="fas fa-star"></i>',
    '📈': '<i class="fas fa-chart-line"></i>',
    '🔧': '<i class="fas fa-tools"></i>',
    '📞': '<i class="fas fa-phone"></i>',
    '🎉': '<i class="fas fa-party-horn"></i>',
    '🤝': '<i class="fas fa-handshake"></i>',
    '📋': '<i class="fas fa-clipboard-list"></i>',
    '🗄️': '<i class="fas fa-database"></i>',
    '🔐': '<i class="fas fa-key"></i>',
    '🛡️': '<i class="fas fa-shield-alt"></i>',
    '🧪': '<i class="fas fa-flask"></i>',
    '📱': '<i class="fas fa-mobile-alt"></i>',
    '🎛️': '<i class="fas fa-sliders-h"></i>',
    '📊': '<i class="fas fa-chart-bar"></i>',
    '🎯': '<i class="fas fa-bullseye"></i>',
    '✨': '<i class="fas fa-magic"></i>',
    '🌟': '<i class="fas fa-star"></i>',
    '🚀': '<i class="fas fa-rocket"></i>',
    '📈': '<i class="fas fa-chart-line"></i>',
    '🔮': '<i class="fas fa-crystal-ball"></i>',
    '📋': '<i class="fas fa-clipboard"></i>',
    '✅': '<i class="fas fa-check-circle"></i>',
    '🔧': '<i class="fas fa-wrench"></i>',
    '📞': '<i class="fas fa-phone-alt"></i>',
    '🎉': '<i class="fas fa-birthday-cake"></i>'
};

// Fonction pour ajouter Font Awesome à un fichier HTML
function addFontAwesome(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si Font Awesome est déjà présent
    if (!content.includes('font-awesome') && !content.includes('fa-')) {
        // Ajouter Font Awesome après Google Fonts
        content = content.replace(
            /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins[^>]*>/,
            '$&\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Font Awesome ajouté à ${filePath}`);
    }
}

// Fonction pour remplacer les emojis dans un fichier
function replaceEmojis(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [emoji, icon] of Object.entries(emojiToIcon)) {
        if (content.includes(emoji)) {
            content = content.replace(new RegExp(emoji, 'g'), icon);
            modified = true;
            console.log(`🔄 Remplacé ${emoji} par ${icon} dans ${filePath}`);
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Modifications sauvegardées dans ${filePath}`);
    }
}

// Fonction principale
function main() {
    const htmlFiles = [
        'index.html',
        'auth.html',
        'pricing.html',
        'checkout.html',
        'features-new.html',
        'partners.html',
        'contact.html',
        'guide.html',
        'download.html',
        'profile.html',
        'admin-dashboard.html',
        'admin-subscription-plans.html'
    ];
    
    console.log('🚀 Début du remplacement des emojis...\n');
    
    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`📄 Traitement de ${file}...`);
            addFontAwesome(file);
            replaceEmojis(file);
            console.log('');
        } else {
            console.log(`❌ Fichier ${file} non trouvé`);
        }
    });
    
    console.log('🎉 Remplacement des emojis terminé !');
}

// Exécuter le script
if (require.main === module) {
    main();
}

module.exports = { addFontAwesome, replaceEmojis, emojiToIcon };
