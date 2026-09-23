const movies = [
  {id:1,title:"John Wick 4",rating:8.1,genre:["Action","Thriller"],language:"English",duration:"169 min",release:"Mar 24, 2023",poster:"assets/posters/john-wick-4.svg",description:"John Wick uncovers a path to defeating the High Table while facing new enemies and old friends.",cast:["Keanu Reeves","Donnie Yen","Bill Skarsgård","Laurence Fishburne"]},
  {id:2,title:"Dune: Part Two",rating:8.5,genre:["Sci-Fi","Adventure"],language:"English",duration:"166 min",release:"Mar 1, 2024",poster:"assets/posters/dune-part-two.svg",description:"Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",cast:["Timothée Chalamet","Zendaya","Rebecca Ferguson","Austin Butler"]},
  {id:3,title:"Kung Fu Panda 4",rating:7.8,genre:["Animation","Action"],language:"English",duration:"94 min",release:"Mar 8, 2024",poster:"assets/posters/kung-fu-panda-4.svg",description:"Po must train a new warrior while preparing for his next big adventure in the Valley of Peace.",cast:["Jack Black","Awkwafina","Viola Davis","Dustin Hoffman"]},
  {id:4,title:"The Batman",rating:7.9,genre:["Action","Crime"],language:"English",duration:"176 min",release:"Mar 4, 2022",poster:"assets/posters/the-batman.svg",description:"Batman investigates corruption in Gotham while a mysterious criminal leaves a trail of clues.",cast:["Robert Pattinson","Zoë Kravitz","Paul Dano","Jeffrey Wright"]},
  {id:5,title:"Avatar: The Way of Water",rating:7.6,genre:["Adventure","Sci-Fi"],language:"English",duration:"192 min",release:"Dec 16, 2022",poster:"assets/posters/avatar-way-of-water.svg",description:"The Sully family seeks refuge among the ocean clans of Pandora and discovers a new world.",cast:["Sam Worthington","Zoe Saldaña","Sigourney Weaver","Stephen Lang"]},
  {id:6,title:"Oppenheimer",rating:8.4,genre:["Biography","Drama"],language:"English",duration:"180 min",release:"Jul 21, 2023",poster:"assets/posters/oppenheimer.svg",description:"A historical drama following the scientific and personal journey behind the development of the atomic bomb.",cast:["Cillian Murphy","Emily Blunt","Matt Damon","Robert Downey Jr."]},
  {id:7,title:"Top Gun: Maverick",rating:8.3,genre:["Action","Drama"],language:"English",duration:"131 min",release:"May 27, 2022",poster:"assets/posters/top-gun-maverick.svg",description:"Maverick returns to train a new generation of pilots for a dangerous mission.",cast:["Tom Cruise","Miles Teller","Jennifer Connelly","Jon Hamm"]},
  {id:8,title:"Spider-Man: Across the Spider-Verse",rating:8.7,genre:["Animation","Action"],language:"English",duration:"140 min",release:"Jun 2, 2023",poster:"assets/posters/spider-verse.svg",description:"Miles Morales travels across the multiverse and meets a team of Spider-People protecting its existence.",cast:["Shameik Moore","Hailee Steinfeld","Oscar Isaac","Brian Tyree Henry"]}
];

const cinemas = [
  {id:"october",name:"CineMisr October",location:"6th of October City",image:"assets/cinemas/october.svg"},
  {id:"nasr-city",name:"CineMisr Nasr City",location:"Nasr City",image:"assets/cinemas/nasr-city.svg"},
  {id:"maadi",name:"CineMisr Maadi",location:"Maadi",image:"assets/cinemas/maadi.svg"},
  {id:"alexandria",name:"CineMisr Alexandria",location:"Alexandria",image:"assets/cinemas/alexandria.svg"}
];

const showtimes = ["12:00 PM","3:00 PM","6:30 PM","9:00 PM"];

function getMovie(id){ return movies.find(m => m.id === Number(id)) || movies[0]; }
function getSelectedMovie(){ return getMovie(localStorage.getItem("selectedMovieId") || 1); }
function getSelectedCinema(){ return cinemas.find(c => c.id === localStorage.getItem("selectedCinemaId")) || cinemas[0]; }
