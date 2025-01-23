import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Character = ({ token }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedRealm, setSelectedRealm] = useState('');
  const [characterData, setCharacterData] = useState(null);
  const [characterMedia, setCharacterMedia] = useState(null);
  const [characterEquipment, setCharacterEquipment] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/characters`, {
          params: { token },
        });
        setCharacters(response.data.wow_accounts.flatMap(account => account.characters));
      } catch (error) {
        console.error('Error fetching characters list:', error);
      }
    };

    fetchCharacters();
  }, [token]);

  const fetchCharacterData = async (realm, characterName) => {
    try {
      const response = await axios.get(`http://localhost:5000/character`, {
        params: { realm: realm.toLowerCase(), characterName: characterName.toLowerCase(), token },
      });
      setCharacterData(response.data);

      const mediaResponse = await axios.get(`http://localhost:5000/character/media`, {
        params: { realm: realm.toLowerCase(), characterName: characterName.toLowerCase(), token },
      });
      setCharacterMedia(mediaResponse.data);

      const equipmentResponse = await axios.get(`http://localhost:5000/character/equipment`, {
        params: { realm: realm.toLowerCase(), characterName: characterName.toLowerCase(), token },
      });
      const equipmentItems = equipmentResponse.data.equipped_items;

      // Fetch media for each item
      const equipmentWithMedia = await Promise.all(equipmentItems.map(async (item) => {
        const mediaResponse = await axios.get(`http://localhost:5000/item/media`, {
          params: { itemId: item.item.id, token },
        });
        return {
          ...item,
          media: mediaResponse.data,
        };
      }));

      setCharacterEquipment(equipmentWithMedia);
    } catch (error) {
      console.error('Error fetching character data:', error);
    }
  };

  return (
    <div>
      <h1>Characters</h1>
      <div>
        <label htmlFor="realm-select">Select Realm:</label>
        <select
          id="realm-select"
          onChange={(e) => setSelectedRealm(e.target.value)}
        >
          <option value="">--Select Realm--</option>
          {[...new Set(characters.map(character => character.realm.name))].map((realm) => (
            <option key={realm} value={realm}>
              {realm}
            </option>
          ))}
        </select>
      </div>
      {selectedRealm && (
        <div>
          <label htmlFor="character-select">Select Character:</label>
          <select
            id="character-select"
            onChange={(e) => {
              const [realm, characterName] = e.target.value.split('|');
              fetchCharacterData(realm, characterName);
            }}
          >
            <option value="">--Select Character--</option>
            {characters.filter(character => character.realm.name === selectedRealm).map((character) => (
              <option key={character.id} value={`${selectedRealm}|${character.name}`}>
                {character.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {characterData ? (
        <div>
          <h2>{characterData.name}</h2>
          <p>Realm: {characterData.realm.name}</p>
          <p>Level: {characterData.level}</p>
          {characterMedia && characterMedia.assets ? (
            <img src={characterMedia.assets.find(asset => asset.key === 'main-raw').value} alt={`${characterData.name} Render`} />
          ) : (
            <p>Loading character render...</p>
          )}
          <div className="equipment">
            {characterEquipment.map(item => (
              <div key={item.item.id} className="equipment-item">
                <img src={item.media.assets[0].value} alt={item.name} />
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Select a realm and character to fetch character data</p>
      )}
    </div>
  );
};

export default Character;