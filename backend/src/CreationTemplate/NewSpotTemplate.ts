import Content, { LayoutStyle } from '../model/Content.model';
import generateId from '../middleware/IdGenerator.middleware';
import fs from 'fs';
import path from 'path';

const csvDataAsList = [
    {
        "id": "content_1736296224598_0aU0XQwTE4NTi5LN9nRVndnaSARtTP8nMF5CyByKq1",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Check-in/Check-out",
        "description": null,
        "contact": "{}",
        "mainText": "Our check-in process is quick and efficient, ensuring you settle into your room with ease. Check-out is equally seamless, with staff available to assist you at any time. Flexible options are available upon request.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCalendarCheck.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736294516864_RbiFTaSOYBtAT6oVhX9KThNxP0PDEEMdIb0JeLQ98D",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Wi-Fi",
        "description": null,
        "contact": "{}",
        "mainText": "Our hotel provides seamless Wi-Fi connectivity throughout the premises. Whether you are in your room, at the restaurant, or in the lobby, you can stay connected to what matters most. Enjoy fast and reliable internet for work, streaming, or browsing at your convenience.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaWifiSolid.svg",
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736374246014_Wi-Fi_2.png",
        "carouselImages": "{https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736374251653_Wi-Fi_2.png}"
    },
    {
        "id": "content_1736296473669_85jhCjPVp8xpYT34gAePZPQk4ROL7wF5lR5Nwjx8je",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Swimming Pool",
        "description": null,
        "contact": "{}",
        "mainText": "Take a refreshing dip in our swimming pool, available exclusively to hotel guests. Relax on poolside loungers or enjoy a leisurely swim in a serene and inviting setting.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaSwimmerSolid.svg",
        "bannerImage": null,
        "carouselImages": "{https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736375098423_Swimming_Pool_4.png}"
    },
    {
        "id": "content_1736296514763_M81tzBZdkaWHS2UChM5kHgGXNZqqAQobgJv2zCITRM",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Spa Services",
        "description": null,
        "contact": "{}",
        "mainText": "Indulge in relaxation at our spa, offering a range of rejuvenating treatments, including massages, facials, and body therapies. Reservations are recommended for a truly personalized experience.\n\n",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaSwatchbookSolid.svg",
        "bannerImage": null,
        "carouselImages": "{https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736819494597_Massage_Grand_Velas_Riviera_Nayarit_Mexico-1024x682.jpg}"
    },
    {
        "id": "content_1736296246933_O8oouNLdDziIO1D07GFiJ1QlRmZbBEoGc9cVPQcVZW",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Hotel Policies",
        "description": null,
        "contact": "{}",
        "mainText": "Our policies are designed to ensure a pleasant stay for all guests. Please familiarize yourself with our guidelines on cancellations, pets, and smoking, which are crafted to maintain a safe and comfortable environment.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaFolderPlusSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296173293_GZVG4iAPco3Lhd43ImqBbyoGLt29RizUnDml79Y9TZ",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "About the Hotel",
        "description": null,
        "contact": "{}",
        "mainText": "Welcome to our hotel! We are dedicated to providing a comfortable and memorable stay for all our guests. From luxurious accommodations to exceptional service, we strive to exceed your expectations at every turn.\n\n",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaChartPieSolid.svg",
        "bannerImage": null,
        "carouselImages": "{}"
    },
    {
        "id": "content_1736296205477_R4Ng6oE7QaFVKIkr8nqLwFH3E5lIDRmW1T7VhxVBB6",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Address & Directions",
        "description": null,
        "contact": "{}",
        "mainText": "Located conveniently in the heart of the city, our hotel is easily accessible by car, public transport, or shuttle services. Detailed directions are available on our website, or you can contact the front desk for personalized guidance.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCampgroundSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736736810632_8OaDMeqcGNiY85kuSYLUY1mANW7IFVkx6VKvMQxGvF",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Welcome",
        "description": null,
        "contact": "{}",
        "mainText": "Dear Guest,\n\nWe are delighted to have you with us at [Hotel Name]. Whether youâre here for business or leisure, our team is dedicated to making your stay both comfortable and memorable.\n\nThis Digital Compendium is designed to be your guide throughout your stay. Here, youâll find all the essential information you need about our hotel, services, and facilities, as well as tips for exploring the local area.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/ThumbsUp.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296304396_pI8J5w6wGuNKVj8Hsu6DAXJOdWD87QFC0CNa3xJvgi",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Parking Information",
        "description": null,
        "contact": "{}",
        "mainText": "Ample parking is available for all guests, with options for valet or self-parking. Spaces are secure and easily accessible, providing peace of mind for those traveling by car.\n\n",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCarSideSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296329532_7a8ZfwGR9YCt8srGHffhLdoeKImOS7oHfuArqIPhqh",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Public Transport Options",
        "description": null,
        "contact": "{}",
        "mainText": "Our location offers excellent access to public transportation, with nearby bus stops and train stations connecting you to major attractions and business centers. Speak to our concierge for route recommendations.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaShuttleVanSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296286691_tTLz7aUbIm3DaIailw4cbQjjmNu5wURTqyciGMwj5G",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Shuttle Bus",
        "description": null,
        "contact": "{}",
        "mainText": "We offer convenient shuttle services to and from the airport, as well as popular local destinations. Schedules and pick-up points are designed to align with your itinerary, ensuring hassle-free transport throughout your stay.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCarSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296364642_0RN6EP3fe2f0rPlnYWqSv0qfhaUz9eiaoftgYkvlqV",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Restaurants",
        "description": null,
        "contact": "{}",
        "mainText": "Delight in our on-site restaurants, where a variety of cuisines are prepared by world-class chefs. Whether you prefer a casual meal or a fine dining experience, our menus cater to all tastes and dietary preferences.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCookieBiteSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296398516_rxrn7Sgx3kQX1mKzWxXGVMTbS0Wr5ersGoCS7z0NLr",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Room Service",
        "description": null,
        "contact": "{}",
        "mainText": "Enjoy the convenience of room service, offering a wide selection of meals and beverages delivered directly to your door. Available 24/7, itâs perfect for a late-night snack or a relaxing breakfast in bed.\n\n",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCookieSolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296531514_nMtDaWdWGdVE6MsKqeWS5RNennYW19kHKyAtyCt0Xs",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Kids'Activities",
        "description": null,
        "contact": "{}",
        "mainText": "Keep the little ones entertained with our selection of Kids' activities, from supervised play areas to fun workshops. Our family-friendly environment ensures a memorable stay for guests of all ages.",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaBabySolid.svg",
        "bannerImage": null,
        "carouselImages": null
    },
    {
        "id": "content_1736296436960_rCaxazGGtu14h1epyobJktnQIZ66Sjx5eanUx6T7F6",
        "isLeaf": "t",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{}",
        "name": "Fitness Center",
        "description": null,
        "contact": "{}",
        "mainText": "Maintain your workout routine at our fully equipped fitness center, featuring modern machines and free weights. Open daily, the facility is designed for your convenience and comfort.\n\n",
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaRunningSolid.svg",
        "bannerImage": null,
        "carouselImages": "{https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736375130362_Fitness_Center_2.png}"
    },
    {
        "id": "content_1736295904719_TNToKtduUReASA1NESTPX8RjXmQLaGZdUvOdUxVZI4",
        "isLeaf": "f",
        "layoutStyle": "sidebar",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{content_1736296286691_tTLz7aUbIm3DaIailw4cbQjjmNu5wURTqyciGMwj5G,content_1736296304396_pI8J5w6wGuNKVj8Hsu6DAXJOdWD87QFC0CNa3xJvgi,content_1736296329532_7a8ZfwGR9YCt8srGHffhLdoeKImOS7oHfuArqIPhqh}",
        "name": "Transportation",
        "description": null,
        "contact": "{}",
        "mainText": null,
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCarSolid.svg",
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736818194015_03_limousine_transfer.jpg",
        "carouselImages": "{}"
    },
    {
        "id": "content_1736295915431_nByt5ZsnFhwiiLLGjvnZOXw7VqZBf97LQILIfWr0ti",
        "isLeaf": "f",
        "layoutStyle": "sidebar",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{content_1736296364642_0RN6EP3fe2f0rPlnYWqSv0qfhaUz9eiaoftgYkvlqV,content_1736296398516_rxrn7Sgx3kQX1mKzWxXGVMTbS0Wr5ersGoCS7z0NLr}",
        "name": "Dining",
        "description": null,
        "contact": "{}",
        "mainText": null,
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/Dine.svg",
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736374994622_Dining_4.png",
        "carouselImages": "{}"
    },
    {
        "id": "content_1736295924694_eyeLQCwjBlap24wc3cQF1wdfGoZ5UKyEJzhHUjsY46",
        "isLeaf": "f",
        "layoutStyle": "sidebar",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{content_1736296436960_rCaxazGGtu14h1epyobJktnQIZ66Sjx5eanUx6T7F6,content_1736296473669_85jhCjPVp8xpYT34gAePZPQk4ROL7wF5lR5Nwjx8je,content_1736296514763_M81tzBZdkaWHS2UChM5kHgGXNZqqAQobgJv2zCITRM,content_1736296531514_nMtDaWdWGdVE6MsKqeWS5RNennYW19kHKyAtyCt0Xs}",
        "name": "Amenities",
        "description": null,
        "contact": "{}",
        "mainText": null,
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaCitySolid.svg",
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736818249234_health-club.jpg",
        "carouselImages": "{}"
    },
    {
        "id": "content_1736295895201_jiK7WxZ8shVDpAyaJuMs5ax2gh3bxmlvon5JAdr2Mu",
        "isLeaf": "f",
        "layoutStyle": "sidebar",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{content_1736296173293_GZVG4iAPco3Lhd43ImqBbyoGLt29RizUnDml79Y9TZ,content_1736296205477_R4Ng6oE7QaFVKIkr8nqLwFH3E5lIDRmW1T7VhxVBB6,content_1736296224598_0aU0XQwTE4NTi5LN9nRVndnaSARtTP8nMF5CyByKq1,content_1736296246933_O8oouNLdDziIO1D07GFiJ1QlRmZbBEoGc9cVPQcVZW}",
        "name": "General Information",
        "description": null,
        "contact": "{}",
        "mainText": null,
        "searchTags": null,
        "geoLocation": "{}",
        "iconImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/spot_icons/LiaBookMedicalSolid.svg",
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736817590320_66a74dc32229f98f5c146a7b_6698555b4b2239bc7e530d1a_hotel20manager20hoteliers.jpeg",
        "carouselImages": "{}"
    },
    {
        "id": "content_1735889471549_G53gq3y7TRjzokm2ufKikxoE1ZcnKCQs2mmm15libc",
        "isLeaf": "f",
        "layoutStyle": "None",
        "visible": "t",
        "editable": "user_1734913147291_sC2y81lheCuJW2N4Kj9w1g5SuOnfJAIdNy073NWZMdE3X",
        "attributes": "{content_1736736810632_8OaDMeqcGNiY85kuSYLUY1mANW7IFVkx6VKvMQxGvF,content_1736294516864_RbiFTaSOYBtAT6oVhX9KThNxP0PDEEMdIb0JeLQ98D,content_1736295895201_jiK7WxZ8shVDpAyaJuMs5ax2gh3bxmlvon5JAdr2Mu,content_1736295904719_TNToKtduUReASA1NESTPX8RjXmQLaGZdUvOdUxVZI4,content_1736295915431_nByt5ZsnFhwiiLLGjvnZOXw7VqZBf97LQILIfWr0ti,content_1736295924694_eyeLQCwjBlap24wc3cQF1wdfGoZ5UKyEJzhHUjsY46}",
        "name": "Services & Facilities",
        "description": null,
        "contact": "{}",
        "mainText": null,
        "searchTags": "HotelManagedEndpoint",
        "geoLocation": "\"\"",
        "iconImage": null,
        "bannerImage": "https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/S3Id_1734913147060_3FzlEtGzQRZFgNtQ4G5S39HgBXqhloAOe3o0q80RKPEO9/1736740310217_services-facilities.jpg",
        "carouselImages": "{}"
    }
]

const hotelcreateContentTree = async (userId: string): Promise<string> => {
    // Separate leaf and non-leaf nodes
    const leafNodes = csvDataAsList.filter(node => node.isLeaf === 't');
    const nonLeafNodes = csvDataAsList.filter(node => node.isLeaf !== 't');

    const idMap: Record<string, string> = {};

    // Create leaf nodes
    for (const leaf of leafNodes) {
        const id = generateId('content');
        idMap[leaf.id] = id;

        const leafContentPoint: Content | any = {
            id,
            name: leaf.name,
            layoutStyle: (leaf.layoutStyle as LayoutStyle) || LayoutStyle.NONE,
            isLeaf: true,
            visible: leaf.visible === 't',
            editable: userId,
            mainText: leaf.mainText || null,
            iconImage: leaf.iconImage || null,
            bannerImage: leaf.bannerImage || null,
            carouselImages: leaf.carouselImages ? [leaf.carouselImages.replace(/^{|}$/g, '')] : [],
        };

        await Content.create(leafContentPoint);
    }

    let returnedHotelEntryContentId:string = "";
    // Create non-leaf nodes
    for (const nonLeaf of nonLeafNodes) {
        const id = generateId('content');
        idMap[nonLeaf.id] = id;

        let childIds: string[] = [];
        try {
            const rawAttributes = nonLeaf.attributes.replace(/^{|}$/g, ''); // Remove "{" and "}"
            childIds = rawAttributes.split(',').map(attrId => attrId.trim()).map(attrId => {
                if (!idMap[attrId]) {
                    throw new Error(`Child ID ${attrId} not found in idMap`);
                }
                return idMap[attrId];
            });
        } catch (error) {
            console.error(`Error parsing attributes for non-leaf node ${nonLeaf.id}:`, error);
            continue;
        }
        if (nonLeaf.searchTags) returnedHotelEntryContentId = id;

        const nonleafContentPoint: Content | any = {
            id,
            name: nonLeaf.name,
            layoutStyle: (nonLeaf.layoutStyle as LayoutStyle) || LayoutStyle.NONE,
            isLeaf: false,
            visible: nonLeaf.visible === 't',
            editable: userId,
            attributes: childIds,
            mainText: nonLeaf.mainText || null,
            iconImage: nonLeaf.iconImage || null,
            bannerImage: nonLeaf.bannerImage || null,
            carouselImages: nonLeaf.carouselImages ? [nonLeaf.carouselImages.replace(/^{|}$/g, '')] : [],
            searchTags: nonLeaf.searchTags || null
        };

        await Content.create(nonleafContentPoint);
    }
    return returnedHotelEntryContentId;
};

export default hotelcreateContentTree;

