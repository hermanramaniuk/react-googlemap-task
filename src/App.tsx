import React from "react"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import { SafeAreaView, StyleSheet, TextInput, View, Text, Button } from "react-native"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Marker, GoogleMap} from '@react-google-maps/api';

const App = () => {

  // search query input
  const [searchQuery, onChangeText] = React.useState("London");
  // searched result locations
  const [locations, setLocations] = React.useState([]);
  // show markers button disability
  const [disabled, setDisabled] = React.useState(false);

  // search for only search business and london around places
  const searchOptions = {
    types: ['establishment'],
    origin: new google.maps.LatLng(51.51753, -0.11213)
  }

  // google places autocomplete function
  // loading(boolean), status(string), data(object) - search result
  // debounce - delay time of requesting search api(for cost effective)
  const {
    value,
    suggestions: { loading, status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: searchOptions,
    debounce: 2000,
  });

  // build search result UI with data
  const renderSuggestions = (): JSX.Element => {
    const suggestions = data.map(({ place_id, types,
    structured_formatting: { main_text, secondary_text } }: any) => (
      <View
          style={{
            padding: 16,
            borderBottomColor: "black",
            borderBottomWidth: 1,
            flexDirection: "row"
          }}
          key={place_id}
        >
          <Text style={{ flex: 1 }}>{types[0]}</Text>
          <View style={{ flex: 2 }}>
            <Text style={{ fontSize: 20 }}>{main_text}</Text>
            <Text>{secondary_text}</Text>
          </View>
      </View>
    ));

    return (
      <>
        {suggestions}
      </>
    );
  };

  // pickup locations on the map
  const onPickup = () => {
    const tempLocations = [] as any;
    let index = 0;
    setLocations([]);
    setDisabled(true);
    data.map(({ place_id, description }: any) => {
      getGeocode({ address: description })
        .then((results) => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          tempLocations.push({ lat, lng, place_id });
          if(index === data.length - 1)
            setLocations(tempLocations);
          index++;
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
      
      return tempLocations;
    });
  };

  // display google map and markers with searched results
  const showGoogleMap = () => {
    const markers = locations.map(({ lat, lng, place_id }: any) => (
      <Marker
        key={place_id}
        position={{lat, lng}}
      />
    ));

    return (
      <View>
        <Button
          onPress={onPickup}
          title="Show Markers On the Map"
          disabled={disabled}
        />
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
        >
          { markers }
        </GoogleMap>
      </View>
    );
  };

  // set value to call search api
  React.useEffect(() => {
    setValue(searchQuery);
    setDisabled(false);
    setLocations([]);
  }, [searchQuery, setValue]);

  // make toast with conditional params
  React.useEffect(() => {
    if(!loading && data.length > 0 && value.length > 0) {
      toast(`${data.length} results found for query: ${value}`);
    }
  }, [value, data, loading]);
  
  // return main view
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
      />

      {status === "OK" && renderSuggestions()}
      {status === "OK" && showGoogleMap()}

      <ToastContainer />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
});

const containerStyle = {
  width: '600px',
  height: '600px'
};

const center = {
  lat: 51.51753,
  lng: -0.11213
};

export default App
