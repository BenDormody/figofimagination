# Fig of Imagination - Poetry Website

A beautiful, responsive website for displaying personal poetry collections. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design using a carefully crafted design system
- **Dynamic Content**: Loads poems from JSON data files
- **Individual Poem Pages**: Dedicated pages for reading each poem with pagination
- **Catalogue System**: Browse all poems with search and filtering
- **Collection Navigation**: Navigate between poems in the same collection
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Accessibility**: Built with accessibility best practices
- **Performance**: Optimized for fast loading and smooth interactions
- **GitHub Pages Ready**: Easy deployment to GitHub Pages

## File Structure

```
figofimagination/
├── index.html              # Home page
├── catalogue.html          # Catalogue page
├── poem.html              # Individual poem display page
├── css/
│   ├── main.css           # Global styles and design system
│   ├── home.css           # Home page specific styles
│   ├── catalogue.css      # Catalogue page styles
│   └── poem.css           # Poem display page styles
├── js/
│   ├── main.js            # Core functionality
│   ├── home.js            # Home page logic
│   ├── catalogue.js       # Catalogue functionality
│   └── poem.js            # Poem display logic
├── data/
│   └── poems.json         # Poem data storage
└── README.md              # This file
```

## Getting Started

### Local Development

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Start editing** the `data/poems.json` file to add your own poems

### Adding New Poems

Edit the `data/poems.json` file to add your poems:

```json
{
  "id": 9,
  "title": "Your Poem Title", // or null for untitled
  "content": [
    "First stanza line 1\nFirst stanza line 2",
    "Second stanza line 1\nSecond stanza line 2"
  ],
  "collection": "Your Collection Name", // or null
  "dateCreated": "2024-03-20",
  "featured": false, // true to feature on home page
  "tags": ["tag1", "tag2"]
}
```

### Poem Page Features

The individual poem pages (`poem.html?id=X`) include:

- **Pagination**: Multi-stanza poems are split into pages for better reading
- **Collection Navigation**: Browse other poems in the same collection
- **Keyboard Controls**:
  - Arrow keys to navigate pages
  - Home/End keys to jump to first/last page
- **Breadcrumb Navigation**: Easy navigation back to catalogue
- **Metadata Display**: Shows date, collection, and tags
- **Responsive Design**: Optimized for all screen sizes
- **Print Styles**: Clean print layout for physical copies

### Poem Structure

- **id**: Unique number for each poem
- **title**: Poem title (null for untitled poems)
- **content**: Array of stanzas (each stanza is a string with line breaks)
- **collection**: Collection name or null for standalone poems
- **dateCreated**: Date in YYYY-MM-DD format
- **featured**: Boolean to mark poems for the featured section
- **tags**: Array of tags for categorization

## Design System

The website uses a comprehensive design system with:

- **Color Palette**: Teal and warm yellow theme
- **Typography**: Inter font family with responsive sizing
- **Spacing**: 8px base unit system
- **Components**: Cards, buttons, navigation with consistent styling
- **Animations**: Subtle hover effects and page transitions

## Deployment

### GitHub Pages

1. **Push your code** to a GitHub repository
2. **Go to Settings** → Pages
3. **Select source**: Deploy from a branch
4. **Choose branch**: main (or master)
5. **Save** and wait for deployment

### Other Hosting

The website can be deployed to any static hosting service:

- Netlify
- Vercel
- AWS S3
- Any web server

## Customization

### Colors

Edit the CSS variables in `css/main.css`:

```css
:root {
  --primary-dark-teal: #1a4a4a;
  --primary-teal: #2d6a6a;
  /* ... other colors */
}
```

### Typography

Change fonts in `css/main.css`:

```css
:root {
  --font-primary: "Your Font", sans-serif;
}
```

### Layout

Modify spacing and layout in the CSS files using the design system variables.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Optimized CSS with efficient selectors
- Minimal JavaScript with modern ES6+ features
- Responsive images and lazy loading support
- Fast loading with minimal dependencies

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios
- Focus management

## Future Enhancements

Potential features to add:

- [ ] Catalogue page with search and filtering
- [ ] Individual poem display pages
- [ ] Dark/light theme toggle
- [ ] Print-friendly layouts
- [ ] Social sharing
- [ ] Poem favorites/bookmarking
- [ ] Audio recordings
- [ ] Comment system

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues:

1. Check the documentation in `design.md`
2. Review the code comments
3. Create an issue in the repository

---

**Built with ❤️ for sharing poetry with the world**
