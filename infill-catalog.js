/** Footprints include every overhang, display and mounting foot, in local metres.
 * These are layout contracts, not scaling factors: human-sized geometry stays human-sized.
 */
export const INFILL_CATALOG={
 microshop:{size:[7.2,5.3,4.8],layer:'frontage',name:'Corner microshop'},
 vendor:{size:[5.3,4.4,3.8],layer:'frontage',name:'Produce stall'},
 repair:{size:[6.3,4.5,4.1],layer:'frontage',name:'Repair booth'},
 noodlebar:{size:[6.8,5.0,4.4],layer:'frontage',name:'Noodle kitchen'},
 coffeebar:{size:[4.4,3.8,3.8],layer:'frontage',name:'Coffee bar'},
 clinic:{size:[5.6,4.6,4.5],layer:'frontage',name:'Street clinic'},
 arcade:{size:[5.5,4.5,4.1],layer:'frontage',name:'Pocket arcade'},
 florist:{size:[5.4,4.8,4.1],layer:'frontage',name:'Botanical stall'},
 droneworks:{size:[6.5,4.8,4.2],layer:'frontage',name:'Drone workshop'},
 teashop:{size:[4.8,4.4,3.9],layer:'frontage',name:'Tea pavilion'},
 lockers:{size:[3.8,2,2.7],layer:'services',name:'Parcel lockers'},
 cargo:{size:[4.5,3.4,2.7],layer:'services',name:'Cargo stack'},
 utility:{size:[4.5,2.8,3.3],layer:'services',name:'Utility station'},
 seating:{size:[5.5,3.8,3.8],layer:'services',name:'Shaded seating'},
 garden:{size:[4.5,3.5,1.6],layer:'services',name:'Planter group'},
 vending:{size:[3.2,2.3,2.8],layer:'services',name:'Vending pair'},
 recyclers:{size:[3.9,1.8,2.1],layer:'services',name:'Sorting station'},
 battery:{size:[3.1,2.1,2.9],layer:'services',name:'Battery exchange'},
 courierpad:{size:[3.5,3.3,2.2],layer:'services',name:'Courier drone dock'},
 newsstand:{size:[2.5,1.8,2.8],layer:'services',name:'Information kiosk'},
 bikedock:{size:[4.7,2.7,2.3],layer:'services',name:'Scooter charging rack'},
 dining:{size:[4.5,4.2,3.5],layer:'services',name:'Courtyard dining'},
 hydration:{size:[2.3,2.0,2.9],layer:'services',name:'Water refill'},
 comms:{size:[2.2,1.8,3.0],layer:'services',name:'Public comms booth'},
 maptable:{size:[2.7,2.5,1.8],layer:'services',name:'Neighbourhood map'},
 toolrack:{size:[2.5,1.8,2.9],layer:'services',name:'Tool exchange'},
 flowercart:{size:[2.8,2.0,2.3],layer:'services',name:'Plant cart'},
 benches:{size:[3.4,1.6,1.3],layer:'services',name:'Street bench'},
 cooling:{size:[4.3,3.2,2.9],layer:'rooftops',name:'Cooling bank'},
 solar:{size:[4.8,3.1,1.8],layer:'rooftops',name:'Solar rack'},
 roofgarden:{size:[4.8,3.5,2.8],layer:'rooftops',name:'Roof garden'},
 greenhouse:{size:[5.9,4.5,3.8],layer:'rooftops',name:'Hydroponic house'},
 antenna:{size:[3.9,3.9,5.7],layer:'rooftops',name:'Communications mast'},
 laundry:{size:[5.0,3.6,2.9],layer:'rooftops',name:'Resident utility terrace'},
 ductbank:{size:[5.8,3.7,2.9],layer:'rooftops',name:'Ventilation service bank'}
};
export const NEIGHBORHOOD_PROGRAMS=[
 {business:['droneworks','repair','coffeebar'],amenities:['cargo','battery','recyclers','courierpad','utility','toolrack','comms'],roof:['ductbank','cooling','antenna']},
 {business:['clinic','coffeebar','microshop'],amenities:['newsstand','bikedock','hydration','dining','lockers','maptable','benches','seating'],roof:['solar','antenna','roofgarden']},
 {business:['droneworks','repair','clinic'],amenities:['battery','courierpad','vending','recyclers','utility','comms','toolrack'],roof:['antenna','ductbank','cooling']},
 {business:['microshop','teashop','arcade','vendor'],amenities:['bikedock','vending','hydration','recyclers','lockers','garden','comms','benches','flowercart'],roof:['laundry','greenhouse','solar','roofgarden']},
 {business:['noodlebar','arcade','vendor','coffeebar','microshop'],amenities:['dining','vending','newsstand','recyclers','courierpad','toolrack','comms','benches'],roof:['ductbank','laundry','antenna']},
 {business:['florist','teashop','coffeebar'],amenities:['hydration','dining','garden','bikedock','newsstand','flowercart','maptable','benches','seating'],roof:['greenhouse','roofgarden','solar','laundry']}
];
