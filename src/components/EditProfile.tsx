import { useState, useEffect } from 'react';
import { Eye, MapPin, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Country, State, City } from 'country-state-city';

export default function EditProfile({ onBack, onViewProfile }) {
  const [location, setLocation] = useState({
    country: 'France',
    countryCode: 'FR',
    state: '',
    stateCode: '',
    city: 'Paris'
  });

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [isManualCity, setIsManualCity] = useState(false);

  useEffect(() => {
    if (location.countryCode) {
      setStates(State.getStatesOfCountry(location.countryCode));
    } else {
      setStates([]);
    }
    setIsManualCity(false);
  }, [location.countryCode]);

  useEffect(() => {
    if (location.countryCode && location.stateCode) {
      setCities(City.getCitiesOfState(location.countryCode, location.stateCode));
    } else {
      setCities([]);
    }
    setIsManualCity(false);
  }, [location.countryCode, location.stateCode]);

  const RadioGroup = ({ label, options, name, selectedValue = null }) => (
    <div className="mb-6">
      <label className="block text-neutral-700 text-sm font-bold mb-3">{label}</label>
      <div className="flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name={name} 
                className="peer appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-neutral-300 rounded-full checked:border-blue-500 transition-all"
                defaultChecked={opt === selectedValue}
              />
              <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span className="text-neutral-600 text-xs sm:text-sm group-hover:text-neutral-900 transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const CheckboxGroup = ({ label, options, name }) => (
    <div className="mb-6">
      <label className="block text-neutral-700 text-sm font-bold mb-3">{label}</label>
      <div className="flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              name={name} 
              className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-neutral-300 rounded bg-white text-blue-500 focus:ring-0 transition-all"
            />
            <span className="text-neutral-600 text-xs sm:text-sm group-hover:text-neutral-900 transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-2">Edit My Profile</h1>
            <p className="text-neutral-500 text-xs sm:text-sm max-w-2xl">
              Answering these profile questions allows other users to find you in search results and helps us find you more relevant matches. 
              <span className="text-orange-500 ml-1">Answer all the questions below to complete this step.</span>
            </p>
          </div>
          <button 
            onClick={onViewProfile}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <Eye className="w-4.5 h-4.5" />
            View my profile
          </button>
        </div>

        <form className="space-y-8 sm:space-y-12">
          {/* Basic Information */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Your basic information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">First name</label>
                <input type="text" defaultValue="Marc" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Display name</label>
                <input type="text" defaultValue="Marc Dubois" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base" />
              </div>
            </div>

            <RadioGroup 
              label="I am a:" 
              name="gender" 
              options={["Man", "Woman", "Other"]} 
              selectedValue="Man" 
            />

            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Date of birth</label>
              <p className="text-orange-500 text-[10px] sm:text-xs italic mb-2">*To protect your privacy, we only keep your month and year of birth.</p>
              <div className="flex gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-[200px]">
                  <select className="w-full appearance-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm">
                    <option>Month</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="relative flex-1 max-w-[200px]">
                  <select className="w-full appearance-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm">
                    <option>Year</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="relative">
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  <select 
                    value={location.countryCode}
                    onChange={(e) => {
                      const country = countries.find(c => c.isoCode === e.target.value);
                      setLocation({
                        ...location, 
                        countryCode: e.target.value, 
                        country: country ? country.name : '',
                        state: '',
                        stateCode: '',
                        city: ''
                      });
                    }}
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white appearance-none text-sm"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">État / Province</label>
                <div className="relative">
                  <select 
                    value={location.stateCode}
                    disabled={!location.countryCode}
                    onChange={(e) => {
                      const state = states.find(s => s.isoCode === e.target.value);
                      setLocation({
                        ...location, 
                        stateCode: e.target.value, 
                        state: state ? state.name : '',
                        city: ''
                      });
                    }}
                    className="w-full px-4 pr-10 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white appearance-none disabled:bg-neutral-50 disabled:text-neutral-400 text-sm"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Ville</label>
                <div className="relative space-y-2">
                  {!isManualCity ? (
                    <div className="relative">
                      <select 
                        value={location.city}
                        disabled={!location.stateCode}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER') {
                            setIsManualCity(true);
                            setLocation({...location, city: ''});
                          } else {
                            setLocation({...location, city: e.target.value});
                          }
                        }}
                        className="w-full px-4 pr-10 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white appearance-none disabled:bg-neutral-50 disabled:text-neutral-400 text-sm"
                      >
                        <option value="">Select City</option>
                        {cities.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                        {location.stateCode && <option value="OTHER">+ Other (Manual entry)</option>}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </div>
                  ) : (
                    <div className="relative flex gap-2">
                      <input 
                        type="text"
                        placeholder="Enter city name"
                        value={location.city}
                        onChange={(e) => setLocation({...location, city: e.target.value})}
                        className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-xs sm:text-sm"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={() => setIsManualCity(false)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-lg border border-orange-200"
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Your appearance</h2>
            <RadioGroup 
              label="Hair color:" 
              name="hair" 
              options={["Bald / Shaved", "Black", "Blond", "Brown", "Grey / White", "Chestnut", "Redhead", "I change often", "Other"]} 
              selectedValue="Brown" 
            />
            <RadioGroup 
              label="Eye color:" 
              name="eyes" 
              options={["Black", "Blue", "Brown", "Green", "Gray", "Hazelnut", "Other"]} 
              selectedValue="Blue" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Height</label>
                <input type="text" defaultValue="178 cm" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Weight</label>
                <input type="text" defaultValue="75 kg" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm sm:text-base" />
              </div>
            </div>
            <RadioGroup 
              label="Body:" 
              name="body" 
              options={["Little", "Thin", "Sporty", "Average", "A few extra kilos", "Round", "Large & magnificent"]} 
              selectedValue="Sporty" 
            />
            <RadioGroup 
              label="Your ethnicity is primarily:" 
              name="ethnicity" 
              options={["African", "African American", "Afro-Caribbean", "Arabic", "Asian", "Caucasian (White)", "Hispanic / Latino", "Indian", "Metis", "Pacific Islander", "Other", "I prefer not to comment"]} 
            />
            <CheckboxGroup 
              label="Body art:" 
              name="art" 
              options={["Brand", "Earrings", "Piercing", "Tattoo", "Other", "None", "I prefer not to comment"]} 
            />
            <RadioGroup 
              label="I consider my appearance to be:" 
              name="rating" 
              options={["Below average", "Average", "Attractive", "Very attractive"]} 
            />
          </section>

          {/* Lifestyle */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Your lifestyle</h2>
            <RadioGroup label="Do you drink?" name="drink" options={["Drink", "Don't drink", "Wood on occasion"]} />
            <RadioGroup label="Do you smoke?" name="smoke" options={["I smoke", "I don't smoke", "I smoke occasionally"]} />
            <RadioGroup label="Family situation:" name="family" options={["Bachelor", "Separated", "Widower", "Divorce", "Other", "I prefer not to comment"]} />
            <RadioGroup label="Do you want children (more children)?" name="want_children" options={["Yes", "I'm not sure", "No"]} />
          </section>

          {/* Occupation */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Occupation</h2>
            <RadioGroup 
              label="Occupation:" 
              name="occupation" 
              options={["Entertainment / Media", "Hairdresser / Personal beauty", "Independent", "Transportation", "Administrative / Office", "Teaching / University", "Finance / Banking", "Information Technology", "Medical / Dental", "Sales / Marketing", "Student", "Unemployed", "Other"]} 
              selectedValue="Information Technology"
            />
            <RadioGroup label="Professional status:" name="status" options={["Student", "Part-time work", "Full time", "Homemaker", "Retirement", "Unemployed", "Other", "I prefer not to comment"]} />
          </section>

          {/* Living Situation */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Living situation</h2>
            <RadioGroup label="Living situation:" name="living" options={["I live alone", "I live with friends", "I live with my family", "I live with my children", "I live with my partner", "Other", "I prefer not to comment"]} />
            <RadioGroup label="Ready to move:" name="move" options={["I would only move within my own country", "I would move to another country", "I do not wish to move", "I'm not sure about moving"]} />
            <CheckboxGroup label="Relationship you are looking for:" name="looking_for" options={["Corresponding", "Friendship", "Love / Dating", "Long-term relationship"]} />
          </section>

          {/* Cultural */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">Your cultural origins/values</h2>
            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Nationality</label>
              <input type="text" placeholder="Your nationality" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm sm:text-base" />
            </div>
            <RadioGroup label="Education level:" name="education" options={["Primary (elementary) school", "College", "High school", "Vocational education", "License", "Mastery", "Doctorate"]} />
            <RadioGroup label="English language proficiency:" name="english" options={["Don't speak", "Average", "Good", "Very good", "Good command"]} />
            <RadioGroup label="French language proficiency:" name="french" options={["Don't speak", "Average", "Good", "Very good", "Good command"]} />
            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Religion</label>
              <input type="text" placeholder="Your religion" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm sm:text-base" />
            </div>
            <RadioGroup label="Religious values:" name="rel_values" options={["I'm not that religious", "Average", "Very religious", "I prefer not to comment"]} />
            <RadioGroup label="Polygamy:" name="polygamy" options={["I accept polygamy", "I am against polygamy", "I might accept polygamy"]} />
            <RadioGroup label="Astrological sign:" name="astro" options={["Aquarius", "Aries", "Cancer", "Capricorn", "Gemini", "Leo", "Libra", "Pisces", "Sagittarius", "Scorpio", "Taurus", "Virgo", "I don't know"]} />
          </section>

          {/* In your own words */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 sm:mb-6">In your own words</h2>
            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">Your profile title</label>
              <input type="text" defaultValue="qshqkjfqsfhk" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm sm:text-base" />
            </div>
            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">A glimpse of yourself</label>
              <textarea rows={4} defaultValue="qsqskjdlkqskjslsdqdjflksdfjslfjkljsfs" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-sm sm:text-base"></textarea>
            </div>
            <div className="mb-6">
              <label className="block text-neutral-500 text-xs sm:text-sm mb-1">What you are looking for in a partner</label>
              <textarea rows={4} defaultValue="sqdfqjqsdlkfjlmqdkfmlqdjfmljfmlkqjfmlkdsjflk sdkfjsdlkfjlgdsjfls" className="w-full px-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-sm sm:text-base"></textarea>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-center pt-4 sm:pt-8">
            <button 
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 sm:px-16 py-3 sm:py-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm sm:text-base"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
