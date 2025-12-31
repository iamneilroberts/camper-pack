/**
 * CamperPack - Inventory Management
 */

// Personal categories that support per-traveler quantities
const PERSONAL_CATEGORIES = ['clothing', 'toiletries', 'meds', 'other'];

// Icon choices with searchable keywords
const ICON_DATA = [
  // Camping & Outdoors
  { icon: '🏕️', keywords: 'camp camping campsite tent outdoor' },
  { icon: '⛺', keywords: 'tent camping shelter outdoor' },
  { icon: '🔥', keywords: 'fire campfire flame hot burn' },
  { icon: '🪵', keywords: 'wood log firewood lumber' },
  { icon: '🏔️', keywords: 'mountain peak outdoor hiking' },
  { icon: '⛰️', keywords: 'mountain hill outdoor hiking' },
  { icon: '🌲', keywords: 'tree evergreen pine forest' },
  { icon: '🌳', keywords: 'tree deciduous forest nature' },
  { icon: '🌴', keywords: 'palm tree tropical beach' },
  { icon: '🌵', keywords: 'cactus desert plant' },
  { icon: '🥾', keywords: 'hiking boot shoe outdoor footwear' },
  { icon: '🎒', keywords: 'backpack bag pack gear camping' },
  { icon: '🧭', keywords: 'compass navigation direction' },
  { icon: '🔦', keywords: 'flashlight torch light' },
  { icon: '🪔', keywords: 'lamp lantern light oil' },
  { icon: '🏮', keywords: 'lantern lamp light japanese' },
  { icon: '⛱️', keywords: 'umbrella beach sun shade' },
  { icon: '🌄', keywords: 'sunrise mountain morning' },
  { icon: '🌅', keywords: 'sunrise sunset beach ocean' },
  { icon: '🏞️', keywords: 'park nature landscape scenic' },
  { icon: '🛶', keywords: 'canoe kayak boat paddle water' },
  { icon: '🚣', keywords: 'rowing boat paddle water' },
  { icon: '🎣', keywords: 'fishing rod pole fish' },
  { icon: '🐟', keywords: 'fish fishing seafood' },
  { icon: '🦈', keywords: 'shark fish ocean' },
  { icon: '🐠', keywords: 'fish tropical aquarium' },
  { icon: '🐡', keywords: 'fish blowfish puffer' },
  { icon: '🦐', keywords: 'shrimp seafood' },
  { icon: '🦀', keywords: 'crab seafood beach' },
  { icon: '🦞', keywords: 'lobster seafood' },
  { icon: '🏖️', keywords: 'beach sand ocean vacation' },
  { icon: '🏝️', keywords: 'island tropical beach' },
  { icon: '⚓', keywords: 'anchor boat ship marine' },
  { icon: '🧗', keywords: 'climbing rock outdoor sport' },
  { icon: '🏃', keywords: 'running jogging exercise sport' },
  { icon: '🚶', keywords: 'walking hiking person' },

  // Vehicles & Travel
  { icon: '🚗', keywords: 'car auto vehicle sedan' },
  { icon: '🚙', keywords: 'suv car vehicle truck' },
  { icon: '🚐', keywords: 'van minivan vehicle camper' },
  { icon: '🚛', keywords: 'truck semi vehicle hauler' },
  { icon: '🚚', keywords: 'truck delivery vehicle moving' },
  { icon: '🏎️', keywords: 'race car vehicle fast' },
  { icon: '🛻', keywords: 'pickup truck vehicle' },
  { icon: '🚌', keywords: 'bus vehicle transport' },
  { icon: '🚎', keywords: 'trolley bus vehicle' },
  { icon: '🚑', keywords: 'ambulance emergency medical vehicle' },
  { icon: '🚒', keywords: 'fire truck emergency vehicle' },
  { icon: '🚓', keywords: 'police car vehicle emergency' },
  { icon: '🚕', keywords: 'taxi cab vehicle' },
  { icon: '🛵', keywords: 'scooter motorcycle vehicle' },
  { icon: '🏍️', keywords: 'motorcycle bike vehicle' },
  { icon: '🚲', keywords: 'bicycle bike cycling' },
  { icon: '🛴', keywords: 'scooter kick vehicle' },
  { icon: '✈️', keywords: 'airplane plane flight travel' },
  { icon: '🛫', keywords: 'airplane takeoff flight departure' },
  { icon: '🛬', keywords: 'airplane landing flight arrival' },
  { icon: '🚀', keywords: 'rocket space launch' },
  { icon: '🛸', keywords: 'ufo spaceship flying saucer' },
  { icon: '🚁', keywords: 'helicopter aircraft' },
  { icon: '🛥️', keywords: 'boat speedboat motorboat' },
  { icon: '⛵', keywords: 'sailboat boat sailing' },
  { icon: '🚢', keywords: 'ship boat cruise vessel' },
  { icon: '🛳️', keywords: 'cruise ship boat passenger' },
  { icon: '⛽', keywords: 'gas fuel pump station' },
  { icon: '🗺️', keywords: 'map world travel navigation' },
  { icon: '📍', keywords: 'pin location marker map' },
  { icon: '🧳', keywords: 'luggage suitcase travel bag' },
  { icon: '🎫', keywords: 'ticket pass travel admission' },
  { icon: '🛂', keywords: 'passport control immigration travel' },
  { icon: '🛃', keywords: 'customs travel border' },
  { icon: '🛄', keywords: 'baggage claim luggage travel' },
  { icon: '🛅', keywords: 'luggage storage locker travel' },

  // Clothing & Accessories
  { icon: '👕', keywords: 'tshirt shirt clothing top' },
  { icon: '👚', keywords: 'blouse shirt clothing womens' },
  { icon: '👔', keywords: 'tie necktie dress shirt formal' },
  { icon: '👖', keywords: 'jeans pants trousers clothing' },
  { icon: '🩳', keywords: 'shorts clothing pants' },
  { icon: '👗', keywords: 'dress clothing womens' },
  { icon: '👘', keywords: 'kimono robe japanese clothing' },
  { icon: '🥻', keywords: 'sari indian clothing dress' },
  { icon: '🩱', keywords: 'swimsuit onepiece bathing' },
  { icon: '👙', keywords: 'bikini swimsuit bathing' },
  { icon: '🩲', keywords: 'briefs underwear swimsuit' },
  { icon: '🩴', keywords: 'sandal flipflop shoe beach' },
  { icon: '🧥', keywords: 'coat jacket clothing outerwear' },
  { icon: '🥼', keywords: 'lab coat jacket white' },
  { icon: '🦺', keywords: 'safety vest reflective' },
  { icon: '🧤', keywords: 'gloves mittens hands cold' },
  { icon: '🧣', keywords: 'scarf neck cold winter' },
  { icon: '🧦', keywords: 'socks feet clothing' },
  { icon: '👟', keywords: 'sneaker shoe athletic running' },
  { icon: '👞', keywords: 'shoe dress loafer formal' },
  { icon: '👠', keywords: 'heel shoe womens dress' },
  { icon: '👡', keywords: 'sandal shoe womens' },
  { icon: '👢', keywords: 'boot shoe womens tall' },
  { icon: '🥿', keywords: 'flat shoe womens' },
  { icon: '🥾', keywords: 'hiking boot shoe outdoor' },
  { icon: '👒', keywords: 'hat sunhat womens summer' },
  { icon: '🎩', keywords: 'tophat hat formal' },
  { icon: '🧢', keywords: 'cap baseball hat' },
  { icon: '⛑️', keywords: 'helmet rescue safety hard' },
  { icon: '🪖', keywords: 'helmet military army' },
  { icon: '👑', keywords: 'crown royal king queen' },
  { icon: '👓', keywords: 'glasses eyewear reading' },
  { icon: '🕶️', keywords: 'sunglasses shades eyewear' },
  { icon: '🥽', keywords: 'goggles safety swim ski' },
  { icon: '🎽', keywords: 'running shirt athletic jersey' },
  { icon: '👛', keywords: 'purse wallet bag' },
  { icon: '👜', keywords: 'handbag purse bag' },
  { icon: '💼', keywords: 'briefcase bag work business' },
  { icon: '🎒', keywords: 'backpack bag school' },
  { icon: '👝', keywords: 'clutch bag purse' },
  { icon: '💍', keywords: 'ring jewelry wedding diamond' },
  { icon: '💎', keywords: 'gem diamond jewelry' },
  { icon: '📿', keywords: 'beads necklace prayer' },
  { icon: '⌚', keywords: 'watch time wrist' },
  { icon: '🕰️', keywords: 'clock mantle time' },

  // Kitchen & Food
  { icon: '🍳', keywords: 'cooking frying pan egg kitchen' },
  { icon: '🥘', keywords: 'pot pan cooking paella' },
  { icon: '🍲', keywords: 'pot stew soup cooking' },
  { icon: '🫕', keywords: 'fondue pot cooking cheese' },
  { icon: '🍽️', keywords: 'plate dining dishes cutlery' },
  { icon: '🥣', keywords: 'bowl cereal soup' },
  { icon: '🥡', keywords: 'takeout box container food' },
  { icon: '🥢', keywords: 'chopsticks utensils asian' },
  { icon: '🥄', keywords: 'spoon utensil eating' },
  { icon: '🍴', keywords: 'fork knife utensils cutlery' },
  { icon: '🔪', keywords: 'knife kitchen cutting chef' },
  { icon: '🧊', keywords: 'ice cube cold freezer' },
  { icon: '🧂', keywords: 'salt shaker seasoning spice' },
  { icon: '🫙', keywords: 'jar container mason storage' },
  { icon: '🥫', keywords: 'can canned food tin' },
  { icon: '🍶', keywords: 'sake bottle japanese' },
  { icon: '🍾', keywords: 'champagne bottle wine celebrate' },
  { icon: '🍷', keywords: 'wine glass red drink' },
  { icon: '🍸', keywords: 'cocktail martini drink glass' },
  { icon: '🍹', keywords: 'tropical drink cocktail' },
  { icon: '🍺', keywords: 'beer mug drink alcohol' },
  { icon: '🍻', keywords: 'beer mugs cheers drink' },
  { icon: '🥂', keywords: 'champagne glasses toast celebrate' },
  { icon: '🥃', keywords: 'whiskey glass tumbler drink' },
  { icon: '🫗', keywords: 'pour liquid pitcher' },
  { icon: '☕', keywords: 'coffee cup hot drink mug' },
  { icon: '🫖', keywords: 'teapot tea kettle' },
  { icon: '🍵', keywords: 'tea cup green hot drink' },
  { icon: '🧃', keywords: 'juice box drink' },
  { icon: '🥛', keywords: 'milk glass drink dairy' },
  { icon: '🧋', keywords: 'bubble tea boba drink' },
  { icon: '🍼', keywords: 'baby bottle milk' },
  { icon: '💧', keywords: 'water drop liquid' },
  { icon: '🚰', keywords: 'water tap faucet potable' },
  { icon: '🧴', keywords: 'lotion bottle squeeze' },
  { icon: '🍎', keywords: 'apple fruit red food' },
  { icon: '🍏', keywords: 'apple green fruit food' },
  { icon: '🍐', keywords: 'pear fruit food' },
  { icon: '🍊', keywords: 'orange tangerine fruit citrus' },
  { icon: '🍋', keywords: 'lemon citrus fruit yellow' },
  { icon: '🍌', keywords: 'banana fruit yellow' },
  { icon: '🍉', keywords: 'watermelon fruit melon' },
  { icon: '🍇', keywords: 'grapes fruit purple wine' },
  { icon: '🍓', keywords: 'strawberry fruit red berry' },
  { icon: '🫐', keywords: 'blueberry fruit berry' },
  { icon: '🍈', keywords: 'melon cantaloupe fruit' },
  { icon: '🍒', keywords: 'cherry cherries fruit red' },
  { icon: '🍑', keywords: 'peach fruit' },
  { icon: '🥭', keywords: 'mango fruit tropical' },
  { icon: '🍍', keywords: 'pineapple fruit tropical' },
  { icon: '🥥', keywords: 'coconut tropical' },
  { icon: '🥝', keywords: 'kiwi fruit green' },
  { icon: '🍅', keywords: 'tomato vegetable red' },
  { icon: '🍆', keywords: 'eggplant aubergine vegetable' },
  { icon: '🥑', keywords: 'avocado fruit green' },
  { icon: '🥦', keywords: 'broccoli vegetable green' },
  { icon: '🥬', keywords: 'lettuce leafy vegetable greens' },
  { icon: '🥒', keywords: 'cucumber vegetable green' },
  { icon: '🌶️', keywords: 'pepper hot chili spicy' },
  { icon: '🫑', keywords: 'pepper bell vegetable' },
  { icon: '🌽', keywords: 'corn vegetable yellow' },
  { icon: '🥕', keywords: 'carrot vegetable orange' },
  { icon: '🫒', keywords: 'olive oil vegetable' },
  { icon: '🧄', keywords: 'garlic vegetable spice' },
  { icon: '🧅', keywords: 'onion vegetable' },
  { icon: '🥔', keywords: 'potato vegetable' },
  { icon: '🍠', keywords: 'sweet potato yam vegetable' },
  { icon: '🥐', keywords: 'croissant bread pastry' },
  { icon: '🥯', keywords: 'bagel bread breakfast' },
  { icon: '🍞', keywords: 'bread loaf toast' },
  { icon: '🥖', keywords: 'baguette bread french' },
  { icon: '🥨', keywords: 'pretzel snack bread' },
  { icon: '🧀', keywords: 'cheese dairy wedge' },
  { icon: '🥚', keywords: 'egg chicken breakfast' },
  { icon: '🍳', keywords: 'egg fried cooking breakfast' },
  { icon: '🧈', keywords: 'butter dairy spread' },
  { icon: '🥩', keywords: 'meat steak beef' },
  { icon: '🍖', keywords: 'meat bone rib' },
  { icon: '🍗', keywords: 'chicken leg poultry drumstick' },
  { icon: '🥓', keywords: 'bacon meat breakfast pork' },
  { icon: '🍔', keywords: 'burger hamburger fast food' },
  { icon: '🍟', keywords: 'fries french fast food' },
  { icon: '🍕', keywords: 'pizza slice italian' },
  { icon: '🌭', keywords: 'hotdog sausage fast food' },
  { icon: '🥪', keywords: 'sandwich sub lunch' },
  { icon: '🌮', keywords: 'taco mexican food' },
  { icon: '🌯', keywords: 'burrito wrap mexican' },
  { icon: '🫔', keywords: 'tamale mexican corn' },
  { icon: '🥙', keywords: 'pita falafel wrap' },
  { icon: '🧆', keywords: 'falafel middle eastern' },
  { icon: '🥗', keywords: 'salad green healthy' },
  { icon: '🥫', keywords: 'canned food soup beans' },
  { icon: '🍝', keywords: 'pasta spaghetti italian noodles' },
  { icon: '🍜', keywords: 'noodles ramen soup asian' },
  { icon: '🍛', keywords: 'curry rice indian' },
  { icon: '🍣', keywords: 'sushi japanese fish' },
  { icon: '🍱', keywords: 'bento box japanese lunch' },
  { icon: '🥟', keywords: 'dumpling asian chinese' },
  { icon: '🦪', keywords: 'oyster seafood shellfish' },
  { icon: '🍤', keywords: 'shrimp fried seafood' },
  { icon: '🍙', keywords: 'rice ball onigiri japanese' },
  { icon: '🍚', keywords: 'rice bowl white' },
  { icon: '🍘', keywords: 'rice cracker japanese' },
  { icon: '🍥', keywords: 'fish cake japanese narutomaki' },
  { icon: '🥠', keywords: 'fortune cookie chinese' },
  { icon: '🥮', keywords: 'moon cake chinese' },
  { icon: '🍢', keywords: 'oden skewer japanese' },
  { icon: '🍡', keywords: 'dango japanese sweet skewer' },
  { icon: '🍧', keywords: 'shaved ice dessert cold' },
  { icon: '🍨', keywords: 'ice cream dessert cold' },
  { icon: '🍦', keywords: 'ice cream cone soft serve' },
  { icon: '🥧', keywords: 'pie dessert pastry' },
  { icon: '🧁', keywords: 'cupcake dessert cake' },
  { icon: '🍰', keywords: 'cake slice dessert' },
  { icon: '🎂', keywords: 'birthday cake dessert' },
  { icon: '🍮', keywords: 'custard flan pudding dessert' },
  { icon: '🍭', keywords: 'lollipop candy sweet' },
  { icon: '🍬', keywords: 'candy sweet wrapper' },
  { icon: '🍫', keywords: 'chocolate bar candy' },
  { icon: '🍿', keywords: 'popcorn snack movie' },
  { icon: '🧂', keywords: 'salt shaker seasoning' },
  { icon: '🥜', keywords: 'peanuts nuts snack' },
  { icon: '🌰', keywords: 'chestnut nut' },
  { icon: '🍯', keywords: 'honey pot sweet' },
  { icon: '🍪', keywords: 'cookie biscuit dessert' },

  // Electronics & Tech
  { icon: '🔌', keywords: 'plug electric power outlet' },
  { icon: '🔋', keywords: 'battery power energy charge' },
  { icon: '🪫', keywords: 'battery low empty' },
  { icon: '💡', keywords: 'light bulb idea lamp' },
  { icon: '🔆', keywords: 'brightness light high' },
  { icon: '🔅', keywords: 'brightness light low dim' },
  { icon: '📱', keywords: 'phone mobile cell smartphone' },
  { icon: '📲', keywords: 'phone mobile call' },
  { icon: '☎️', keywords: 'phone telephone landline' },
  { icon: '📞', keywords: 'phone receiver call' },
  { icon: '📟', keywords: 'pager beeper' },
  { icon: '📠', keywords: 'fax machine' },
  { icon: '💻', keywords: 'laptop computer portable' },
  { icon: '🖥️', keywords: 'computer desktop monitor' },
  { icon: '🖨️', keywords: 'printer computer print' },
  { icon: '⌨️', keywords: 'keyboard computer typing' },
  { icon: '🖱️', keywords: 'mouse computer click' },
  { icon: '🖲️', keywords: 'trackball computer' },
  { icon: '💽', keywords: 'minidisc storage' },
  { icon: '💾', keywords: 'floppy disk save storage' },
  { icon: '💿', keywords: 'cd disc optical' },
  { icon: '📀', keywords: 'dvd disc video' },
  { icon: '🧮', keywords: 'abacus calculator math' },
  { icon: '📷', keywords: 'camera photo picture' },
  { icon: '📸', keywords: 'camera flash photo' },
  { icon: '📹', keywords: 'video camera camcorder' },
  { icon: '🎥', keywords: 'movie camera film' },
  { icon: '📽️', keywords: 'projector film movie' },
  { icon: '🎬', keywords: 'clapperboard movie film' },
  { icon: '📺', keywords: 'tv television screen' },
  { icon: '📻', keywords: 'radio music audio' },
  { icon: '🎙️', keywords: 'microphone studio recording' },
  { icon: '🎚️', keywords: 'slider level control audio' },
  { icon: '🎛️', keywords: 'knobs control dials audio' },
  { icon: '🧭', keywords: 'compass navigation direction' },
  { icon: '🎧', keywords: 'headphones audio music listening' },
  { icon: '🔊', keywords: 'speaker loud volume audio' },
  { icon: '🔉', keywords: 'speaker medium volume audio' },
  { icon: '🔈', keywords: 'speaker low volume audio' },
  { icon: '🔇', keywords: 'mute speaker silent audio' },
  { icon: '📡', keywords: 'satellite antenna signal' },
  { icon: '⚡', keywords: 'electric lightning power high voltage' },
  { icon: '🎮', keywords: 'game controller video gaming' },
  { icon: '🕹️', keywords: 'joystick game controller arcade' },
  { icon: '🎰', keywords: 'slot machine casino game' },
  { icon: '📟', keywords: 'pager device' },
  { icon: '🔭', keywords: 'telescope astronomy stars' },
  { icon: '🔬', keywords: 'microscope science lab' },

  // Toiletries & Medical
  { icon: '🧴', keywords: 'lotion bottle toiletries squeeze' },
  { icon: '🧷', keywords: 'safety pin diaper' },
  { icon: '🧹', keywords: 'broom cleaning sweep' },
  { icon: '🧺', keywords: 'basket laundry' },
  { icon: '🧻', keywords: 'toilet paper roll tissue' },
  { icon: '🚽', keywords: 'toilet bathroom restroom' },
  { icon: '🚿', keywords: 'shower bathroom water' },
  { icon: '🛁', keywords: 'bathtub bath bathroom' },
  { icon: '🛀', keywords: 'bath person bathing' },
  { icon: '🧼', keywords: 'soap bar cleaning wash' },
  { icon: '🪥', keywords: 'toothbrush dental teeth' },
  { icon: '🪒', keywords: 'razor shave blade' },
  { icon: '🧽', keywords: 'sponge cleaning scrub' },
  { icon: '🪣', keywords: 'bucket pail water' },
  { icon: '🧯', keywords: 'fire extinguisher safety emergency' },
  { icon: '🛒', keywords: 'shopping cart grocery store' },
  { icon: '💊', keywords: 'pill medicine drug capsule' },
  { icon: '💉', keywords: 'syringe needle injection shot' },
  { icon: '🩸', keywords: 'blood drop medical' },
  { icon: '🩹', keywords: 'bandage adhesive bandaid first aid' },
  { icon: '🩺', keywords: 'stethoscope doctor medical' },
  { icon: '🩻', keywords: 'xray medical scan' },
  { icon: '🩼', keywords: 'crutch medical mobility' },
  { icon: '🧪', keywords: 'test tube lab science' },
  { icon: '🌡️', keywords: 'thermometer temperature fever' },
  { icon: '🧬', keywords: 'dna genetics science' },
  { icon: '♿', keywords: 'wheelchair disability accessible' },
  { icon: '🚑', keywords: 'ambulance emergency medical' },
  { icon: '🏥', keywords: 'hospital medical building' },

  // Pets & Animals
  { icon: '🐕', keywords: 'dog pet canine puppy' },
  { icon: '🐶', keywords: 'dog face pet puppy' },
  { icon: '🐩', keywords: 'poodle dog pet' },
  { icon: '🐕‍🦺', keywords: 'service dog guide pet' },
  { icon: '🦮', keywords: 'guide dog service pet' },
  { icon: '🐾', keywords: 'paw prints pet animal' },
  { icon: '🦴', keywords: 'bone dog treat pet' },
  { icon: '🐈', keywords: 'cat pet feline kitty' },
  { icon: '🐱', keywords: 'cat face pet kitty' },
  { icon: '🐈‍⬛', keywords: 'black cat pet feline' },
  { icon: '🐟', keywords: 'fish pet aquarium' },
  { icon: '🐠', keywords: 'tropical fish pet aquarium' },
  { icon: '🐡', keywords: 'blowfish fish pet' },
  { icon: '🦈', keywords: 'shark fish ocean' },
  { icon: '🐙', keywords: 'octopus sea ocean' },
  { icon: '🐚', keywords: 'shell seashell beach' },
  { icon: '🦎', keywords: 'lizard reptile pet' },
  { icon: '🐍', keywords: 'snake reptile pet' },
  { icon: '🐢', keywords: 'turtle tortoise reptile pet' },
  { icon: '🦜', keywords: 'parrot bird pet' },
  { icon: '🐦', keywords: 'bird pet animal' },
  { icon: '🐤', keywords: 'chick baby bird' },
  { icon: '🐣', keywords: 'hatching chick bird' },
  { icon: '🐥', keywords: 'baby chick bird' },
  { icon: '🦆', keywords: 'duck bird water' },
  { icon: '🦅', keywords: 'eagle bird raptor' },
  { icon: '🦉', keywords: 'owl bird night' },
  { icon: '🦇', keywords: 'bat animal night' },
  { icon: '🐺', keywords: 'wolf animal wild' },
  { icon: '🐗', keywords: 'boar pig wild' },
  { icon: '🐴', keywords: 'horse animal riding' },
  { icon: '🦄', keywords: 'unicorn horse magical' },
  { icon: '🐝', keywords: 'bee honeybee insect' },
  { icon: '🐛', keywords: 'bug caterpillar insect' },
  { icon: '🦋', keywords: 'butterfly insect' },
  { icon: '🐌', keywords: 'snail slow animal' },
  { icon: '🐞', keywords: 'ladybug beetle insect' },
  { icon: '🐜', keywords: 'ant insect' },
  { icon: '🪲', keywords: 'beetle bug insect' },
  { icon: '🪳', keywords: 'cockroach bug insect' },
  { icon: '🦟', keywords: 'mosquito bug insect' },
  { icon: '🪰', keywords: 'fly bug insect' },
  { icon: '🪱', keywords: 'worm earthworm' },
  { icon: '🦠', keywords: 'microbe germ bacteria virus' },
  { icon: '🐮', keywords: 'cow face animal farm' },
  { icon: '🐷', keywords: 'pig face animal farm' },
  { icon: '🐽', keywords: 'pig nose snout' },
  { icon: '🐑', keywords: 'sheep animal farm wool' },
  { icon: '🐐', keywords: 'goat animal farm' },
  { icon: '🦙', keywords: 'llama alpaca animal' },
  { icon: '🦒', keywords: 'giraffe animal tall' },
  { icon: '🐘', keywords: 'elephant animal large' },
  { icon: '🦣', keywords: 'mammoth elephant prehistoric' },
  { icon: '🦏', keywords: 'rhinoceros animal horn' },
  { icon: '🦛', keywords: 'hippopotamus animal water' },
  { icon: '🐪', keywords: 'camel desert animal' },
  { icon: '🐫', keywords: 'camel two humps desert' },
  { icon: '🐨', keywords: 'koala animal australia' },
  { icon: '🐻', keywords: 'bear animal forest' },
  { icon: '🐻‍❄️', keywords: 'polar bear arctic animal' },
  { icon: '🐼', keywords: 'panda bear animal' },
  { icon: '🦥', keywords: 'sloth animal slow' },
  { icon: '🦦', keywords: 'otter animal water' },
  { icon: '🦨', keywords: 'skunk animal smell' },
  { icon: '🦘', keywords: 'kangaroo animal australia' },
  { icon: '🦡', keywords: 'badger animal' },
  { icon: '🐾', keywords: 'paw footprints animal pet' },
  { icon: '🦃', keywords: 'turkey bird thanksgiving' },
  { icon: '🐔', keywords: 'chicken bird farm' },
  { icon: '🐓', keywords: 'rooster chicken bird' },
  { icon: '🐣', keywords: 'hatching chick bird' },
  { icon: '🐧', keywords: 'penguin bird cold' },
  { icon: '🕊️', keywords: 'dove bird peace' },
  { icon: '🦢', keywords: 'swan bird white' },
  { icon: '🦩', keywords: 'flamingo bird pink' },
  { icon: '🦚', keywords: 'peacock bird colorful' },
  { icon: '🐊', keywords: 'crocodile alligator reptile' },
  { icon: '🦎', keywords: 'lizard reptile' },
  { icon: '🦖', keywords: 'dinosaur trex prehistoric' },
  { icon: '🦕', keywords: 'dinosaur brontosaurus prehistoric' },
  { icon: '🐳', keywords: 'whale ocean sea' },
  { icon: '🐋', keywords: 'whale ocean sea' },
  { icon: '🐬', keywords: 'dolphin ocean sea' },
  { icon: '🦭', keywords: 'seal ocean animal' },

  // Tools & Hardware
  { icon: '🔧', keywords: 'wrench tool fix repair' },
  { icon: '🔨', keywords: 'hammer tool nail build' },
  { icon: '⚒️', keywords: 'hammer pick tool' },
  { icon: '🛠️', keywords: 'tools hammer wrench repair' },
  { icon: '⛏️', keywords: 'pick axe mining tool' },
  { icon: '🪓', keywords: 'axe chop wood tool' },
  { icon: '🪚', keywords: 'saw cutting wood tool' },
  { icon: '🪛', keywords: 'screwdriver tool screw' },
  { icon: '🔩', keywords: 'nut bolt screw fastener' },
  { icon: '⚙️', keywords: 'gear cog mechanical' },
  { icon: '🗜️', keywords: 'clamp vice tool' },
  { icon: '⚖️', keywords: 'scale balance weight' },
  { icon: '🦯', keywords: 'cane probe white stick' },
  { icon: '🔗', keywords: 'link chain connection' },
  { icon: '⛓️', keywords: 'chains link metal' },
  { icon: '🪝', keywords: 'hook hang tool' },
  { icon: '🧰', keywords: 'toolbox tools kit' },
  { icon: '🧲', keywords: 'magnet attract metal' },
  { icon: '🪜', keywords: 'ladder climb steps' },
  { icon: '🪤', keywords: 'mousetrap trap pest' },
  { icon: '🪢', keywords: 'knot rope tie' },
  { icon: '📐', keywords: 'triangle ruler measure' },
  { icon: '📏', keywords: 'ruler straight edge measure' },
  { icon: '✂️', keywords: 'scissors cut' },
  { icon: '📎', keywords: 'paperclip clip office' },
  { icon: '🖇️', keywords: 'paperclips linked office' },
  { icon: '📌', keywords: 'pushpin tack pin' },
  { icon: '📍', keywords: 'pushpin round pin location' },
  { icon: '🔐', keywords: 'lock key closed secure' },
  { icon: '🔒', keywords: 'lock closed padlock secure' },
  { icon: '🔓', keywords: 'lock open unlock' },
  { icon: '🔏', keywords: 'lock pen secure sign' },
  { icon: '🔑', keywords: 'key lock open door' },
  { icon: '🗝️', keywords: 'key old vintage' },
  { icon: '🗡️', keywords: 'dagger knife blade weapon' },
  { icon: '⚔️', keywords: 'swords crossed weapons' },
  { icon: '🛡️', keywords: 'shield protection defense' },
  { icon: '🏹', keywords: 'bow arrow archery' },
  { icon: '🔫', keywords: 'gun pistol water weapon' },
  { icon: '🪃', keywords: 'boomerang throw return' },
  { icon: '🪄', keywords: 'magic wand wizard' },

  // Bedding & Home
  { icon: '🛏️', keywords: 'bed sleep bedroom furniture' },
  { icon: '🛋️', keywords: 'couch sofa furniture living' },
  { icon: '🪑', keywords: 'chair seat furniture' },
  { icon: '🚪', keywords: 'door entrance exit' },
  { icon: '🪞', keywords: 'mirror reflection' },
  { icon: '🪟', keywords: 'window glass' },
  { icon: '🛖', keywords: 'hut cabin shelter' },
  { icon: '🏠', keywords: 'house home building' },
  { icon: '🏡', keywords: 'house garden home' },
  { icon: '🏘️', keywords: 'houses neighborhood' },
  { icon: '🏚️', keywords: 'house abandoned derelict' },
  { icon: '🏢', keywords: 'building office' },
  { icon: '🏣', keywords: 'post office japanese' },
  { icon: '🏤', keywords: 'post office european' },
  { icon: '🏥', keywords: 'hospital medical' },
  { icon: '🏦', keywords: 'bank building' },
  { icon: '🏨', keywords: 'hotel building lodging' },
  { icon: '🏩', keywords: 'love hotel building' },
  { icon: '🏪', keywords: 'convenience store shop' },
  { icon: '🏫', keywords: 'school building education' },
  { icon: '🏬', keywords: 'department store shopping' },
  { icon: '🏭', keywords: 'factory industrial' },
  { icon: '🏯', keywords: 'castle japanese' },
  { icon: '🏰', keywords: 'castle european' },
  { icon: '💈', keywords: 'barber pole haircut' },
  { icon: '🧸', keywords: 'teddy bear toy stuffed' },
  { icon: '🪆', keywords: 'nesting dolls russian matryoshka' },
  { icon: '🖼️', keywords: 'picture frame art' },
  { icon: '🛍️', keywords: 'shopping bags' },
  { icon: '🎁', keywords: 'gift present wrapped' },
  { icon: '🎈', keywords: 'balloon party' },
  { icon: '🎏', keywords: 'carp streamer koinobori' },
  { icon: '🎀', keywords: 'ribbon bow gift' },
  { icon: '🪭', keywords: 'fan folding' },
  { icon: '🎐', keywords: 'wind chime' },
  { icon: '🏮', keywords: 'lantern red paper' },
  { icon: '🪔', keywords: 'diya lamp oil' },
  { icon: '✉️', keywords: 'envelope mail letter' },
  { icon: '📩', keywords: 'envelope arrow incoming mail' },
  { icon: '📨', keywords: 'envelope incoming mail' },
  { icon: '📧', keywords: 'email envelope' },
  { icon: '💌', keywords: 'love letter envelope heart' },
  { icon: '📥', keywords: 'inbox tray' },
  { icon: '📤', keywords: 'outbox tray' },
  { icon: '📦', keywords: 'package box shipping cardboard' },
  { icon: '🏷️', keywords: 'label tag price' },
  { icon: '🪧', keywords: 'placard sign protest' },

  // Documents & Office
  { icon: '📃', keywords: 'document page paper curl' },
  { icon: '📄', keywords: 'document page paper' },
  { icon: '📑', keywords: 'bookmark tabs document' },
  { icon: '🧾', keywords: 'receipt paper' },
  { icon: '📊', keywords: 'chart bar graph stats' },
  { icon: '📈', keywords: 'chart increasing graph' },
  { icon: '📉', keywords: 'chart decreasing graph' },
  { icon: '🗒️', keywords: 'notepad spiral paper' },
  { icon: '🗓️', keywords: 'calendar spiral date' },
  { icon: '📆', keywords: 'calendar tear off date' },
  { icon: '📅', keywords: 'calendar date' },
  { icon: '🗃️', keywords: 'card file box storage' },
  { icon: '🗳️', keywords: 'ballot box voting' },
  { icon: '🗄️', keywords: 'file cabinet storage' },
  { icon: '📋', keywords: 'clipboard list paper' },
  { icon: '📁', keywords: 'folder file document' },
  { icon: '📂', keywords: 'folder open file' },
  { icon: '🗂️', keywords: 'card index dividers' },
  { icon: '🗞️', keywords: 'newspaper rolled news' },
  { icon: '📰', keywords: 'newspaper news' },
  { icon: '📓', keywords: 'notebook journal' },
  { icon: '📔', keywords: 'notebook decorative' },
  { icon: '📒', keywords: 'ledger notebook' },
  { icon: '📕', keywords: 'book closed red' },
  { icon: '📗', keywords: 'book green' },
  { icon: '📘', keywords: 'book blue' },
  { icon: '📙', keywords: 'book orange' },
  { icon: '📚', keywords: 'books stack reading' },
  { icon: '📖', keywords: 'book open reading' },
  { icon: '🔖', keywords: 'bookmark ribbon' },
  { icon: '🔗', keywords: 'link chain url' },
  { icon: '📝', keywords: 'memo note write' },
  { icon: '✏️', keywords: 'pencil write draw' },
  { icon: '✒️', keywords: 'pen nib write' },
  { icon: '🖊️', keywords: 'pen ballpoint write' },
  { icon: '🖋️', keywords: 'pen fountain write' },
  { icon: '🖌️', keywords: 'paintbrush art draw' },
  { icon: '🖍️', keywords: 'crayon draw color' },
  { icon: '💰', keywords: 'money bag cash' },
  { icon: '💴', keywords: 'yen money japanese' },
  { icon: '💵', keywords: 'dollar money us' },
  { icon: '💶', keywords: 'euro money european' },
  { icon: '💷', keywords: 'pound money british' },
  { icon: '💸', keywords: 'money flying cash' },
  { icon: '💳', keywords: 'credit card payment' },
  { icon: '🧾', keywords: 'receipt bill payment' },
  { icon: '💹', keywords: 'chart yen stocks' },

  // Safety & Warning
  { icon: '⚠️', keywords: 'warning caution alert danger' },
  { icon: '🚨', keywords: 'alarm siren emergency police' },
  { icon: '🆘', keywords: 'sos emergency help' },
  { icon: '🛑', keywords: 'stop sign octagon' },
  { icon: '⛔', keywords: 'no entry prohibited' },
  { icon: '🚫', keywords: 'prohibited forbidden no' },
  { icon: '🚯', keywords: 'no littering trash' },
  { icon: '🚱', keywords: 'no drinking water' },
  { icon: '🚳', keywords: 'no bicycles bikes' },
  { icon: '🚷', keywords: 'no pedestrians walking' },
  { icon: '📵', keywords: 'no mobile phone' },
  { icon: '🔞', keywords: 'no minors eighteen adult' },
  { icon: '☢️', keywords: 'radioactive nuclear hazard' },
  { icon: '☣️', keywords: 'biohazard biological hazard' },
  { icon: '⬆️', keywords: 'arrow up direction' },
  { icon: '↗️', keywords: 'arrow up right direction' },
  { icon: '➡️', keywords: 'arrow right direction' },
  { icon: '↘️', keywords: 'arrow down right direction' },
  { icon: '⬇️', keywords: 'arrow down direction' },
  { icon: '↙️', keywords: 'arrow down left direction' },
  { icon: '⬅️', keywords: 'arrow left direction' },
  { icon: '↖️', keywords: 'arrow up left direction' },
  { icon: '↕️', keywords: 'arrow up down direction' },
  { icon: '↔️', keywords: 'arrow left right direction' },
  { icon: '↩️', keywords: 'arrow return left' },
  { icon: '↪️', keywords: 'arrow return right' },
  { icon: '⤴️', keywords: 'arrow curve up right' },
  { icon: '⤵️', keywords: 'arrow curve down right' },
  { icon: '🔃', keywords: 'arrows clockwise' },
  { icon: '🔄', keywords: 'arrows counterclockwise' },
  { icon: '🔙', keywords: 'back arrow' },
  { icon: '🔚', keywords: 'end arrow' },
  { icon: '🔛', keywords: 'on arrow' },
  { icon: '🔜', keywords: 'soon arrow' },
  { icon: '🔝', keywords: 'top arrow' },

  // Weather & Nature
  { icon: '☀️', keywords: 'sun sunny weather hot' },
  { icon: '🌤️', keywords: 'sun clouds partly cloudy' },
  { icon: '⛅', keywords: 'sun clouds weather' },
  { icon: '🌥️', keywords: 'clouds sun behind mostly cloudy' },
  { icon: '☁️', keywords: 'cloud cloudy weather' },
  { icon: '🌦️', keywords: 'sun rain weather' },
  { icon: '🌧️', keywords: 'rain cloud weather wet' },
  { icon: '⛈️', keywords: 'thunder storm lightning rain' },
  { icon: '🌩️', keywords: 'lightning cloud storm' },
  { icon: '🌨️', keywords: 'snow cloud cold weather' },
  { icon: '❄️', keywords: 'snowflake cold winter ice' },
  { icon: '☃️', keywords: 'snowman winter cold' },
  { icon: '⛄', keywords: 'snowman winter cold' },
  { icon: '🌬️', keywords: 'wind face blow' },
  { icon: '💨', keywords: 'dash wind fast' },
  { icon: '🌪️', keywords: 'tornado twister storm' },
  { icon: '🌫️', keywords: 'fog mist hazy' },
  { icon: '🌊', keywords: 'wave ocean water sea' },
  { icon: '💧', keywords: 'drop water drip' },
  { icon: '💦', keywords: 'sweat droplets water' },
  { icon: '🌈', keywords: 'rainbow colors weather' },
  { icon: '🌙', keywords: 'moon crescent night' },
  { icon: '🌛', keywords: 'moon quarter first night' },
  { icon: '🌜', keywords: 'moon quarter last night' },
  { icon: '🌚', keywords: 'moon new dark' },
  { icon: '🌝', keywords: 'moon full bright' },
  { icon: '🌞', keywords: 'sun face bright' },
  { icon: '⭐', keywords: 'star night sky' },
  { icon: '🌟', keywords: 'star glowing bright' },
  { icon: '✨', keywords: 'sparkles star shine' },
  { icon: '💫', keywords: 'dizzy star circle' },
  { icon: '🌸', keywords: 'cherry blossom flower spring' },
  { icon: '💮', keywords: 'flower white' },
  { icon: '🏵️', keywords: 'rosette flower' },
  { icon: '🌹', keywords: 'rose flower red' },
  { icon: '🥀', keywords: 'wilted flower dead' },
  { icon: '🌺', keywords: 'hibiscus flower tropical' },
  { icon: '🌻', keywords: 'sunflower flower yellow' },
  { icon: '🌼', keywords: 'blossom flower' },
  { icon: '🌷', keywords: 'tulip flower spring' },
  { icon: '🌱', keywords: 'seedling plant sprout' },
  { icon: '🪴', keywords: 'potted plant houseplant' },
  { icon: '🌿', keywords: 'herb plant leaf' },
  { icon: '☘️', keywords: 'shamrock clover irish' },
  { icon: '🍀', keywords: 'four leaf clover lucky' },
  { icon: '🍁', keywords: 'maple leaf fall autumn' },
  { icon: '🍂', keywords: 'fallen leaf autumn' },
  { icon: '🍃', keywords: 'leaf fluttering wind' },
  { icon: '🪹', keywords: 'nest empty bird' },
  { icon: '🪺', keywords: 'nest eggs bird' },
  { icon: '🍄', keywords: 'mushroom fungi' },
  { icon: '🌾', keywords: 'rice sheaf grain' },
  { icon: '💐', keywords: 'bouquet flowers bunch' },
  { icon: '🌍', keywords: 'earth globe europe africa' },
  { icon: '🌎', keywords: 'earth globe americas' },
  { icon: '🌏', keywords: 'earth globe asia australia' },
  { icon: '🌐', keywords: 'globe meridians world' },
  { icon: '🗺️', keywords: 'world map' },
  { icon: '🧭', keywords: 'compass direction navigation' },

  // Sports & Activities
  { icon: '⚽', keywords: 'soccer football ball sport' },
  { icon: '🏀', keywords: 'basketball ball sport' },
  { icon: '🏈', keywords: 'football american ball sport' },
  { icon: '⚾', keywords: 'baseball ball sport' },
  { icon: '🥎', keywords: 'softball ball sport' },
  { icon: '🎾', keywords: 'tennis ball sport' },
  { icon: '🏐', keywords: 'volleyball ball sport' },
  { icon: '🏉', keywords: 'rugby ball sport' },
  { icon: '🥏', keywords: 'frisbee disc flying' },
  { icon: '🎱', keywords: 'pool billiards 8ball' },
  { icon: '🪀', keywords: 'yoyo toy' },
  { icon: '🏓', keywords: 'ping pong table tennis' },
  { icon: '🏸', keywords: 'badminton shuttlecock racket' },
  { icon: '🏒', keywords: 'ice hockey stick puck' },
  { icon: '🏑', keywords: 'field hockey stick ball' },
  { icon: '🥍', keywords: 'lacrosse stick ball' },
  { icon: '🏏', keywords: 'cricket bat ball' },
  { icon: '🪃', keywords: 'boomerang throw return' },
  { icon: '🥅', keywords: 'goal net' },
  { icon: '⛳', keywords: 'golf flag hole' },
  { icon: '🪁', keywords: 'kite fly wind' },
  { icon: '🎯', keywords: 'target dart bullseye' },
  { icon: '🎳', keywords: 'bowling ball pins' },
  { icon: '🎮', keywords: 'game controller video gaming' },
  { icon: '🎲', keywords: 'dice game roll' },
  { icon: '🧩', keywords: 'puzzle piece jigsaw' },
  { icon: '♟️', keywords: 'chess pawn game' },
  { icon: '🎰', keywords: 'slot machine casino' },
  { icon: '🎪', keywords: 'circus tent carnival' },
  { icon: '🎠', keywords: 'carousel horse merry go round' },
  { icon: '🎡', keywords: 'ferris wheel carnival ride' },
  { icon: '🎢', keywords: 'roller coaster amusement ride' },
  { icon: '🛝', keywords: 'slide playground' },
  { icon: '🛹', keywords: 'skateboard sport' },
  { icon: '🛼', keywords: 'roller skate skating' },
  { icon: '⛸️', keywords: 'ice skate skating winter' },
  { icon: '🥌', keywords: 'curling stone winter sport' },
  { icon: '🛷', keywords: 'sled winter snow' },
  { icon: '🎿', keywords: 'ski skiing winter sport' },
  { icon: '⛷️', keywords: 'skier skiing winter' },
  { icon: '🏂', keywords: 'snowboard winter sport' },
  { icon: '🪂', keywords: 'parachute skydiving' },
  { icon: '🏋️', keywords: 'weightlifter gym strength' },
  { icon: '🤸', keywords: 'cartwheel gymnastics' },
  { icon: '🤺', keywords: 'fencing sword sport' },
  { icon: '⛹️', keywords: 'basketball person bouncing' },
  { icon: '🤾', keywords: 'handball person sport' },
  { icon: '🏌️', keywords: 'golf person club' },
  { icon: '🏇', keywords: 'horse racing jockey' },
  { icon: '🧘', keywords: 'yoga meditation lotus' },
  { icon: '🏄', keywords: 'surfing surfer wave' },
  { icon: '🏊', keywords: 'swimming swimmer pool' },
  { icon: '🤽', keywords: 'water polo swimming' },
  { icon: '🚣', keywords: 'rowing boat paddle' },
  { icon: '🧗', keywords: 'climbing rock sport' },
  { icon: '🚵', keywords: 'mountain bike cycling' },
  { icon: '🚴', keywords: 'bicycle cycling biking' },
  { icon: '🏆', keywords: 'trophy winner award' },
  { icon: '🥇', keywords: 'gold medal first place' },
  { icon: '🥈', keywords: 'silver medal second place' },
  { icon: '🥉', keywords: 'bronze medal third place' },
  { icon: '🏅', keywords: 'medal sports award' },
  { icon: '🎖️', keywords: 'military medal award' },
  { icon: '🎗️', keywords: 'ribbon awareness reminder' },
  { icon: '🎟️', keywords: 'ticket admission entry' },
  { icon: '🎫', keywords: 'ticket admission' },

  // Music & Arts
  { icon: '🎵', keywords: 'music note sound' },
  { icon: '🎶', keywords: 'music notes sound' },
  { icon: '🎼', keywords: 'music score sheet' },
  { icon: '🎹', keywords: 'piano keyboard music' },
  { icon: '🥁', keywords: 'drum percussion music' },
  { icon: '🪘', keywords: 'drum long music' },
  { icon: '🎷', keywords: 'saxophone jazz music' },
  { icon: '🎺', keywords: 'trumpet brass music' },
  { icon: '🎸', keywords: 'guitar music rock' },
  { icon: '🪕', keywords: 'banjo music string' },
  { icon: '🎻', keywords: 'violin music string' },
  { icon: '🪗', keywords: 'accordion music' },
  { icon: '🎤', keywords: 'microphone singing karaoke' },
  { icon: '🎧', keywords: 'headphones music audio' },
  { icon: '📯', keywords: 'horn postal music' },
  { icon: '🎭', keywords: 'theater drama masks' },
  { icon: '🪩', keywords: 'disco ball dance party' },
  { icon: '🎨', keywords: 'art palette paint' },
  { icon: '🖼️', keywords: 'picture frame art' },
  { icon: '🎬', keywords: 'clapper movie film' },
  { icon: '🎤', keywords: 'microphone sing perform' },
  { icon: '📸', keywords: 'camera photo flash' },

  // Symbols & Misc
  { icon: '❤️', keywords: 'heart love red' },
  { icon: '🧡', keywords: 'heart orange love' },
  { icon: '💛', keywords: 'heart yellow love' },
  { icon: '💚', keywords: 'heart green love' },
  { icon: '💙', keywords: 'heart blue love' },
  { icon: '💜', keywords: 'heart purple love' },
  { icon: '🖤', keywords: 'heart black love' },
  { icon: '🤍', keywords: 'heart white love' },
  { icon: '🤎', keywords: 'heart brown love' },
  { icon: '💔', keywords: 'heart broken sad' },
  { icon: '❣️', keywords: 'heart exclamation love' },
  { icon: '💕', keywords: 'hearts two love' },
  { icon: '💞', keywords: 'hearts revolving love' },
  { icon: '💓', keywords: 'heart beating love' },
  { icon: '💗', keywords: 'heart growing love' },
  { icon: '💖', keywords: 'heart sparkling love' },
  { icon: '💘', keywords: 'heart arrow cupid love' },
  { icon: '💝', keywords: 'heart ribbon gift love' },
  { icon: '✅', keywords: 'check mark done complete' },
  { icon: '☑️', keywords: 'check box ballot' },
  { icon: '✔️', keywords: 'check mark done' },
  { icon: '❌', keywords: 'x cross mark wrong' },
  { icon: '❎', keywords: 'x cross mark negative' },
  { icon: '➕', keywords: 'plus add more' },
  { icon: '➖', keywords: 'minus subtract less' },
  { icon: '➗', keywords: 'divide division math' },
  { icon: '✖️', keywords: 'multiply times math' },
  { icon: '♻️', keywords: 'recycle environment green' },
  { icon: '💯', keywords: 'hundred perfect score' },
  { icon: '🔢', keywords: 'numbers input' },
  { icon: '🔣', keywords: 'symbols input' },
  { icon: '🔤', keywords: 'letters abc alphabet' },
  { icon: '🅰️', keywords: 'a letter blood' },
  { icon: '🅱️', keywords: 'b letter blood' },
  { icon: '🆎', keywords: 'ab blood type' },
  { icon: '🆑', keywords: 'cl clear' },
  { icon: '🆒', keywords: 'cool awesome' },
  { icon: '🆓', keywords: 'free gratis' },
  { icon: 'ℹ️', keywords: 'information info' },
  { icon: '🆔', keywords: 'id identification' },
  { icon: 'Ⓜ️', keywords: 'm metro circle' },
  { icon: '🆕', keywords: 'new fresh' },
  { icon: '🆖', keywords: 'ng no good' },
  { icon: '🅾️', keywords: 'o blood type' },
  { icon: '🆗', keywords: 'ok button' },
  { icon: '🅿️', keywords: 'p parking' },
  { icon: '🆘', keywords: 'sos help emergency' },
  { icon: '🆙', keywords: 'up mark' },
  { icon: '🆚', keywords: 'vs versus' },
  { icon: '🈁', keywords: 'japanese here' },
  { icon: '🔴', keywords: 'red circle' },
  { icon: '🟠', keywords: 'orange circle' },
  { icon: '🟡', keywords: 'yellow circle' },
  { icon: '🟢', keywords: 'green circle' },
  { icon: '🔵', keywords: 'blue circle' },
  { icon: '🟣', keywords: 'purple circle' },
  { icon: '🟤', keywords: 'brown circle' },
  { icon: '⚫', keywords: 'black circle' },
  { icon: '⚪', keywords: 'white circle' },
  { icon: '🟥', keywords: 'red square' },
  { icon: '🟧', keywords: 'orange square' },
  { icon: '🟨', keywords: 'yellow square' },
  { icon: '🟩', keywords: 'green square' },
  { icon: '🟦', keywords: 'blue square' },
  { icon: '🟪', keywords: 'purple square' },
  { icon: '🟫', keywords: 'brown square' },
  { icon: '⬛', keywords: 'black square' },
  { icon: '⬜', keywords: 'white square' },
  { icon: '◼️', keywords: 'black square medium' },
  { icon: '◻️', keywords: 'white square medium' },
  { icon: '🔶', keywords: 'orange diamond large' },
  { icon: '🔷', keywords: 'blue diamond large' },
  { icon: '🔸', keywords: 'orange diamond small' },
  { icon: '🔹', keywords: 'blue diamond small' },
  { icon: '🔺', keywords: 'red triangle up' },
  { icon: '🔻', keywords: 'red triangle down' },
  { icon: '💠', keywords: 'diamond dot cute' },
  { icon: '🔘', keywords: 'radio button' },
  { icon: '🔳', keywords: 'white square button' },
  { icon: '🔲', keywords: 'black square button' },
];

// Extract just icons for backward compatibility
const ICON_CHOICES = ICON_DATA.map(item => item.icon);

class InventoryManager {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.editingItemId = null;
    this.travelers = [];
  }

  async init() {
    this.bindEvents();
    await this.loadInventory();
  }

  bindEvents() {
    // Search
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderItems();
      });
    }

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderItems();
      });
    });

    // Add item button
    const addBtn = document.getElementById('add-item-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showItemForm());
    }

    // Item form
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
      itemForm.addEventListener('submit', (e) => this.handleItemSubmit(e));

      // Cancel button
      const cancelBtn = itemForm.querySelector('[data-action="cancel"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.hideItemForm());
      }
    }

    // Category change - show/hide traveler quantities
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', () => this.updateTravelerQuantitiesVisibility());
    }
  }

  updateTravelerQuantitiesVisibility() {
    const category = document.getElementById('item-category').value;
    const section = document.getElementById('traveler-quantities-section');

    if (PERSONAL_CATEGORIES.includes(category) && this.travelers.length > 0) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  }

  renderTravelerQuantityInputs(travelerQuantities = {}) {
    const container = document.getElementById('traveler-qty-inputs');
    if (!container || this.travelers.length === 0) return;

    container.innerHTML = this.travelers.map(t => `
      <div class="traveler-qty-row">
        <span class="traveler-name">${this.escapeHtml(t.name)}</span>
        <input type="number" min="0" value="${travelerQuantities[t.id] || 1}"
               data-traveler-id="${t.id}" class="traveler-qty-input">
      </div>
    `).join('');
  }

  getTravelerQuantitiesFromForm() {
    const quantities = {};
    document.querySelectorAll('.traveler-qty-input').forEach(input => {
      const travelerId = input.dataset.travelerId;
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        quantities[travelerId] = qty;
      }
    });
    return quantities;
  }

  async loadInventory() {
    this.items = await window.db.getAllItems();
    this.locations = await window.db.getAllLocations();
    this.travelers = await window.db.getAllTravelers();
    this.renderItems();
  }

  renderItems() {
    const container = document.getElementById('inventory-list');
    if (!container) return;

    let filteredItems = this.items;

    // Apply filter
    if (this.currentFilter !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const location = this.locations.find(l => l.id === item.storage_location);
        return location?.area === this.currentFilter;
      });
    }

    // Apply search
    if (this.searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.category?.toLowerCase().includes(this.searchQuery) ||
        item.notes?.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort by name
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No items found</p>
          <button class="btn btn-primary" onclick="inventory.showItemForm()">Add Your First Item</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredItems.map(item => this.renderItemCard(item)).join('');

    // Initialize swipe-to-delete
    if (!this.swipeInitialized) {
      window.app.initSwipeToDelete(
        container,
        '.item-card',
        async (id) => {
          await window.db.deleteItem(id);
          await this.loadInventory();
        }
      );
      this.swipeInitialized = true;
    }
  }

  renderItemCard(item) {
    const location = this.locations.find(l => l.id === item.storage_location);
    const locationName = location?.name || 'No location';

    const badges = [];
    if (item.is_critical) badges.push('<span class="badge critical">Critical</span>');
    if (item.is_permanent) badges.push('<span class="badge permanent">Permanent</span>');

    const icon = item.icon || this.getCategoryIcon(item.category);

    return `
      <div class="item-card swipeable-item" data-id="${item.id}">
        <div class="item-content" onclick="inventory.showItemForm('${item.id}')">
          <div class="item-icon">${icon}</div>
          <div class="item-details">
            <div class="item-name">${this.escapeHtml(item.name)}</div>
            <div class="item-meta">${this.escapeHtml(locationName)} • ${item.quantity || 1}x</div>
          </div>
          <div class="item-badges">${badges.join('')}</div>
        </div>
        <div class="delete-action">Delete</div>
      </div>
    `;
  }

  getCategoryIcon(category) {
    const icons = {
      clothing: '👕',
      toiletries: '🧴',
      meds: '💊',
      pet: '🐕',
      electronics: '🔌',
      food: '🍎',
      gear: '🎒',
      kitchen: '🍳',
      bedding: '🛏️',
      tools: '🔧',
      other: '📦'
    };
    return icons[category] || '📦';
  }

  async showItemForm(itemId = null) {
    this.editingItemId = itemId;

    // Refresh travelers list
    this.travelers = await window.db.getAllTravelers();

    // Reset form
    const form = document.getElementById('item-form');
    form.reset();

    let travelerQuantities = {};

    // If editing, populate form
    let selectedIcon = '';
    if (itemId) {
      const item = await window.db.getItem(itemId);
      if (item) {
        document.getElementById('item-name').value = item.name || '';
        document.getElementById('item-category').value = item.category || '';
        document.getElementById('item-location').value = item.storage_location || '';
        document.getElementById('item-quantity').value = item.quantity || 1;
        document.getElementById('item-icon').value = item.icon || '';
        selectedIcon = item.icon || '';
        document.getElementById('item-permanent').checked = !!item.is_permanent;
        document.getElementById('item-critical').checked = !!item.is_critical;
        document.getElementById('item-purchase').value = item.purchase_timing || '';
        document.getElementById('item-notes').value = item.notes || '';
        travelerQuantities = item.traveler_quantities || {};
      }
    }

    // Update icon picker button display
    this.updateIconDisplay(selectedIcon);

    // Render traveler quantity inputs
    this.renderTravelerQuantityInputs(travelerQuantities);

    // Update visibility based on category
    this.updateTravelerQuantitiesVisibility();

    // Show form screen
    window.app.showScreen('item-form');
    document.getElementById('page-title').textContent = itemId ? 'Edit Item' : 'Add Item';
  }

  hideItemForm() {
    this.editingItemId = null;
    window.app.showScreen('inventory');
    document.getElementById('page-title').textContent = 'Inventory';
  }

  async handleItemSubmit(e) {
    e.preventDefault();

    const category = document.getElementById('item-category').value;

    const item = {
      name: document.getElementById('item-name').value.trim(),
      category: category,
      storage_location: document.getElementById('item-location').value,
      quantity: parseInt(document.getElementById('item-quantity').value) || 1,
      icon: document.getElementById('item-icon').value.trim(),
      is_permanent: document.getElementById('item-permanent').checked ? 1 : 0,
      is_critical: document.getElementById('item-critical').checked ? 1 : 0,
      purchase_timing: document.getElementById('item-purchase').value || null,
      notes: document.getElementById('item-notes').value.trim() || null
    };

    // For personal categories, save traveler quantities
    if (PERSONAL_CATEGORIES.includes(category) && this.travelers.length > 0) {
      item.traveler_quantities = this.getTravelerQuantitiesFromForm();
    }

    if (this.editingItemId) {
      item.id = this.editingItemId;
    }

    await window.db.saveItem(item);
    await this.loadInventory();
    this.hideItemForm();
  }

  async deleteItem(id) {
    if (confirm('Delete this item?')) {
      await window.db.deleteItem(id);
      await this.loadInventory();
      this.hideItemForm();
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Icon Picker Methods
  updateIconDisplay(icon) {
    const displayEl = document.getElementById('selected-icon');
    const inputEl = document.getElementById('item-icon');
    if (displayEl) {
      displayEl.textContent = icon || '📦';
    }
    if (inputEl) {
      inputEl.value = icon || '';
    }
  }

  showIconPicker() {
    const searchInput = document.getElementById('icon-search');

    // Clear previous search and render all icons
    searchInput.value = '';
    this.renderIconGrid('');

    // Bind search event
    searchInput.oninput = (e) => {
      this.renderIconGrid(e.target.value);
    };

    document.getElementById('icon-picker-modal').classList.remove('hidden');

    // Focus search input for quick typing
    setTimeout(() => searchInput.focus(), 100);
  }

  renderIconGrid(query) {
    const grid = document.getElementById('icon-picker-grid');
    const currentIcon = document.getElementById('item-icon').value;
    const searchTerm = query.toLowerCase().trim();

    // Filter icons based on search query
    const filteredIcons = searchTerm
      ? ICON_DATA.filter(item =>
          item.keywords.toLowerCase().includes(searchTerm) ||
          item.icon === searchTerm
        )
      : ICON_DATA;

    if (filteredIcons.length === 0) {
      grid.innerHTML = '<p class="empty-text" style="grid-column: span 6; text-align: center;">No matching icons</p>';
      return;
    }

    grid.innerHTML = filteredIcons.map(item => `
      <button type="button" class="icon-option ${item.icon === currentIcon ? 'selected' : ''}"
              onclick="inventory.selectIcon('${item.icon}')">
        ${item.icon}
      </button>
    `).join('');
  }

  closeIconPicker() {
    document.getElementById('icon-picker-modal').classList.add('hidden');
  }

  selectIcon(icon) {
    this.updateIconDisplay(icon);
    this.closeIconPicker();
  }

  // Export inventory to JSON
  async exportInventory() {
    const items = await window.db.getAllItems();
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `camperpack-inventory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Import inventory from JSON
  async importInventory(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const items = JSON.parse(e.target.result);
          for (const item of items) {
            await window.db.saveItem(item);
          }
          await this.loadInventory();
          resolve(items.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Export inventory to CSV
  async exportToCSV() {
    const items = await window.db.getAllItems();

    const headers = ['name', 'category', 'storage_location', 'is_permanent', 'is_critical', 'purchase_timing', 'icon', 'quantity', 'notes'];

    const csvRows = [headers.join(',')];

    for (const item of items) {
      const row = headers.map(header => {
        let val = item[header] ?? '';
        // Escape commas and quotes in values
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `camperpack-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Import inventory from CSV
  async importFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const items = this.parseCSV(text);

          let imported = 0;
          for (const item of items) {
            if (item.name) { // Skip empty rows
              await window.db.saveItem(item);
              imported++;
            }
          }

          await this.loadInventory();
          resolve(imported);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Parse CSV text into array of objects
  parseCSV(text) {
    const lines = text.split('\n');
    const items = [];
    let headers = null;

    for (let line of lines) {
      line = line.trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Parse CSV line (handles quoted values)
      const values = this.parseCSVLine(line);

      // First non-comment line is headers
      if (!headers) {
        headers = values.map(h => h.trim().toLowerCase());
        continue;
      }

      // Create item object
      const item = {};
      headers.forEach((header, i) => {
        let val = values[i]?.trim() ?? '';

        // Convert numeric fields
        if (header === 'is_permanent' || header === 'is_critical') {
          item[header] = val === '1' || val.toLowerCase() === 'true' ? 1 : 0;
        } else if (header === 'quantity') {
          item[header] = parseInt(val) || 1;
        } else if (val === '') {
          item[header] = null;
        } else {
          item[header] = val;
        }
      });

      if (item.name) {
        items.push(item);
      }
    }

    return items;
  }

  // Parse a single CSV line, handling quoted values
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    values.push(current);

    return values;
  }

  // Clear all inventory (for reimport)
  async clearInventory() {
    if (!confirm('Delete ALL inventory items? This cannot be undone.')) {
      return false;
    }

    const items = await window.db.getAllItems();
    for (const item of items) {
      await window.db.deleteItem(item.id);
    }

    await this.loadInventory();
    return true;
  }
}

// Export singleton
window.inventory = new InventoryManager();
