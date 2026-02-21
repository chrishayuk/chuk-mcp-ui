import type { Meta, StoryObj } from "@storybook/react";
import { GeostoryRenderer } from "./App";
import type { GeostoryContent } from "./schema";

const meta = {
  title: "Views/Geostory",
  component: GeostoryRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GeostoryRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HistoricalJourney: Story = {
  args: {
    data: {
      type: "geostory",
      version: "1.0",
      title: "The Silk Road: A Journey Through Time",
      basemap: "terrain",
      steps: [
        {
          id: "sr-1",
          title: "Xi'an, China",
          text: "The ancient capital of Chang'an, now Xi'an, served as the eastern terminus of the Silk Road. From here, caravans laden with silk, spices, and precious goods would begin their arduous journey westward through the Gansu Corridor. The city's massive walls and bustling markets were the last taste of Chinese civilization before the vast deserts beyond.",
          location: { lat: 34.26, lon: 108.94 },
          zoom: 8,
          marker: "Eastern Terminus",
        },
        {
          id: "sr-2",
          title: "Samarkand, Uzbekistan",
          text: "Known as the 'Jewel of the Silk Road,' Samarkand was a critical crossroads where Eastern and Western cultures met. The Registan Square, with its stunning madrasas adorned with intricate tile work, stands as testament to the wealth that flowed through this city. Traders exchanged not just goods but ideas, religions, and technologies here.",
          location: { lat: 39.65, lon: 66.96 },
          zoom: 10,
          marker: "Crossroads",
        },
        {
          id: "sr-3",
          title: "Baghdad, Iraq",
          text: "During the Islamic Golden Age, Baghdad was the intellectual capital of the world. The House of Wisdom attracted scholars from across the known world, translating Greek, Persian, and Indian texts into Arabic. Silk Road merchants brought paper-making technology from China, revolutionizing the spread of knowledge throughout the Middle East and Europe.",
          location: { lat: 33.31, lon: 44.37 },
          zoom: 9,
          marker: "House of Wisdom",
        },
        {
          id: "sr-4",
          title: "Constantinople (Istanbul), Turkey",
          text: "The gateway between East and West, Constantinople controlled the vital straits connecting the Black Sea to the Mediterranean. Its Grand Bazaar, one of the oldest covered markets in the world, was where Silk Road goods were traded and redistributed throughout the Roman Empire and later the Byzantine world.",
          location: { lat: 41.01, lon: 28.98 },
          zoom: 10,
          marker: "Gateway to Europe",
        },
        {
          id: "sr-5",
          title: "Venice, Italy",
          text: "The western terminus of the Silk Road, Venice grew fabulously wealthy as the primary European trading partner with the East. Marco Polo departed from these canals on his famous journey to the court of Kublai Khan. The city's opulent architecture and art were funded by centuries of Silk Road commerce.",
          location: { lat: 45.44, lon: 12.32 },
          zoom: 11,
          marker: "Western Terminus",
        },
      ],
    } satisfies GeostoryContent,
  },
};

export const NatureTrail: Story = {
  args: {
    data: {
      type: "geostory",
      version: "1.0",
      title: "Yellowstone Discovery Trail",
      basemap: "satellite",
      steps: [
        {
          id: "nt-1",
          title: "Old Faithful Geyser",
          text: "Begin your journey at the world's most famous geyser. Old Faithful erupts approximately every 90 minutes, shooting thousands of gallons of boiling water up to 180 feet in the air. The surrounding geyser basin contains the largest concentration of geysers in the world.",
          location: { lat: 44.4605, lon: -110.8281 },
          zoom: 15,
          image: "https://example.com/old-faithful.jpg",
        },
        {
          id: "nt-2",
          title: "Grand Prismatic Spring",
          text: "The largest hot spring in the United States and the third largest in the world. Its vivid rainbow colors are produced by thermophilic bacteria that thrive in the mineral-rich hot water. The deep blue center is too hot for microbial life, while the outer rings host different bacterial communities at varying temperatures.",
          location: { lat: 44.5251, lon: -110.8382 },
          zoom: 16,
          image: "https://example.com/grand-prismatic.jpg",
        },
        {
          id: "nt-3",
          title: "Hayden Valley",
          text: "This broad, open valley along the Yellowstone River is one of the park's premier wildlife viewing areas. Bison herds graze on the lush grasses, grizzly bears forage along the riverbanks, and wolves can occasionally be spotted in the early morning hours. The valley was once the bed of an ancient lake.",
          location: { lat: 44.6517, lon: -110.4567 },
          zoom: 13,
          image: "https://example.com/hayden-valley.jpg",
        },
        {
          id: "nt-4",
          title: "Mammoth Hot Springs",
          text: "Conclude your journey at these spectacular travertine terraces. Hot water laden with dissolved limestone rises to the surface and deposits calcium carbonate, creating an ever-changing landscape of white, orange, and brown terraces. Each day, approximately two tons of calcium carbonate are deposited here.",
          location: { lat: 44.9737, lon: -110.7043 },
          zoom: 14,
          image: "https://example.com/mammoth-springs.jpg",
        },
      ],
    } satisfies GeostoryContent,
  },
};

export const UrbanExploration: Story = {
  args: {
    data: {
      type: "geostory",
      version: "1.0",
      title: "Tokyo Neighborhoods: A Walking Tour",
      basemap: "simple",
      steps: [
        {
          id: "ue-1",
          title: "Shibuya Crossing",
          text: "Start at the world's busiest pedestrian crossing. Up to 3,000 people cross at each signal change during peak times. The surrounding area is a hub of youth culture, fashion, and entertainment. The famous Hachiko statue, honoring a loyal dog who waited for his deceased owner every day for nine years, stands at the station's entrance.",
          location: { lat: 35.6595, lon: 139.7004 },
          zoom: 16,
        },
        {
          id: "ue-2",
          title: "Harajuku & Omotesando",
          text: "Walk north to Harajuku, the epicenter of Japanese street fashion and kawaii culture. Takeshita Street overflows with colorful boutiques, crepe shops, and vintage stores. Nearby Omotesando Avenue offers a stark contrast with its tree-lined boulevard of luxury brand flagship stores designed by world-renowned architects.",
          location: { lat: 35.6702, lon: 139.7027 },
          zoom: 16,
        },
        {
          id: "ue-3",
          title: "Shinjuku Golden Gai",
          text: "Venture into this labyrinth of over 200 tiny bars, each seating just a handful of patrons. Nestled in narrow alleys, these establishments range from jazz bars to punk venues to quiet literary hangouts. Golden Gai survived the rapid modernization of Shinjuku and remains a beloved slice of old Tokyo nightlife.",
          location: { lat: 35.6938, lon: 139.7036 },
          zoom: 17,
        },
        {
          id: "ue-4",
          title: "Asakusa & Senso-ji Temple",
          text: "End your tour at Tokyo's oldest Buddhist temple. Founded in 628 AD, Senso-ji is approached through the iconic Kaminarimon (Thunder Gate) with its massive red lantern. The Nakamise-dori shopping street leading to the temple has been serving visitors for centuries, offering traditional crafts, snacks, and souvenirs.",
          location: { lat: 35.7148, lon: 139.7967 },
          zoom: 16,
        },
      ],
    } satisfies GeostoryContent,
  },
};
