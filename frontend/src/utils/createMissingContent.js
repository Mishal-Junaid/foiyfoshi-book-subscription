import * as contentService from '../services/contentService';

// Content sections to create
const missingContentSections = {
  // Home page remaining section
  home: [
    {
      section: 'cta',
      title: 'Start Your Reading Journey Today',
      subtitle: 'Subscribe now and get your first box',
      content: 'Ready to dive into a world of carefully selected books? Our subscription boxes are designed to surprise and delight with each delivery. Start your literary journey today!',
      active: true,
      order: 0
    }
  ],
  
  // About page sections
  about: [
    {
      section: 'about-hero',
      title: 'About FoiyFoshi Books',
      subtitle: 'Our story and mission to bring the joy of reading to Maldivian readers',
      active: true,
      order: 0
    },
    {
      section: 'our-story',
      title: 'Our Story',
      content: 'Founded in 2023, FoiyFoshi Books was born from a simple passion: to make reading more accessible and exciting for people across the Maldives. We understand the challenges of finding good books in our islands, and how expensive importing individual titles can be. That\'s why we created a subscription service that delivers carefully selected books to your doorstep every month. Our name "FoiyFoshi" combines the Dhivehi words for "book" and "good/beautiful," representing our mission to bring beautiful reading experiences to our community. Every book box is curated with care, featuring titles across various genres, special editions, and reading accessories that enhance your experience.',
      active: true,
      order: 0
    },
    {
      section: 'different',
      title: 'What Makes Us Different',
      subtitle: 'Our unique approach to book subscriptions',
      content: '<p>Here at FoiyFoshi Books, we take pride in what sets us apart:</p><ul><li><strong>Curated Selection</strong> - Each book is hand-selected by our team of avid readers to ensure quality and diversity in your reading journey.</li><li><strong>Made With Love</strong> - We personally pack each box with care, adding special touches and surprises to delight our subscribers.</li><li><strong>Community Focus</strong> - We\'re building a community of readers in the Maldives through book clubs, events, and online discussions.</li></ul>',
      active: true,
      order: 0
    },
    {
      section: 'mission',
      title: 'Our Mission',
      content: 'At FoiyFoshi Books, our mission is to foster a love of reading throughout the Maldives by making quality books accessible, affordable, and exciting. We believe that books have the power to transform lives, open minds, and connect people from all backgrounds.',
      active: true,
      order: 0
    }
  ],
  
  // Contact page sections
  contact: [
    {
      section: 'contact-hero',
      title: 'Contact Us',
      subtitle: 'We\'d love to hear from you',
      active: true,
      order: 0
    },
    {
      section: 'contact-info',
      title: 'Get In Touch',
      content: 'Email: info@foiyfoshi.mv\nPhone: +960 7777889\nAddress: FoiyFoshi Books, Chaandhanee Magu, Malé 20-02, Maldives',
      active: true,
      order: 0
    },
    {
      section: 'contact-form',
      title: 'Send Us a Message',
      content: 'Fill out the form below and we\'ll get back to you as soon as possible.',
      active: true,
      order: 0
    }
  ]
};

// Create a content section
async function createContent(content) {
  try {
    const response = await contentService.createContent(content);
    console.log(`Created content section: ${content.section}`);
    return response;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
      console.log(`Section '${content.section}' already exists, skipping...`);
    } else {
      console.error(`Error creating content section '${content.section}':`, error.response?.data?.error || error.message);
    }
    return null;
  }
}

// Main function to create all missing content
export const createMissingContent = async () => {
  try {
    // Flatten all content sections into one array
    const allSections = [
      ...missingContentSections.home,
      ...missingContentSections.about,
      ...missingContentSections.contact
    ];
    
    console.log(`Creating ${allSections.length} content sections...`);
    
    // Create each content section
    const results = [];
    for (const section of allSections) {
      const result = await createContent(section);
      if (result) {
        results.push(result);
      }
    }
    
    return {
      success: true,
      message: `Created ${results.length} content sections`,
      created: results
    };
  } catch (error) {
    console.error('Failed to create content:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
};

// Function to check which content sections are missing
export const checkMissingContent = async () => {
  try {
    // Get all existing content
    const response = await contentService.getAllContent(false);
    const existingContent = response.data;
    
    // Get all section names from existing content
    const existingSections = existingContent.map(item => item.section);
    
    // Flatten all required section names
    const requiredSections = [
      ...missingContentSections.home.map(item => item.section),
      ...missingContentSections.about.map(item => item.section),
      ...missingContentSections.contact.map(item => item.section)
    ];
    
    // Find missing sections
    const missingSections = requiredSections.filter(section => !existingSections.includes(section));
    
    return {
      success: true,
      missingSections,
      existingSections,
      missingCount: missingSections.length,
      existingCount: existingSections.length
    };
  } catch (error) {
    console.error('Failed to check missing content:', error);
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
};
