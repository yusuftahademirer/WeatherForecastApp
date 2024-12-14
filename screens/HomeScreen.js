import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Platform, StatusBar, Image, TextInput, View, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { CalendarDaysIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from 'react-native-progress';
import { storeData } from "../utils/asyncStorage";


export default function HomeScreen() {

    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLocation = (loc) => {
        // console.log("location: ", loc);
        setLocations([]);
        toggleSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
            storeData("city", loc.name);
            // console.log('got forecast: ', data);
        })
    }

    const handleSearch = value => {
        if(value.length > 2) {
            fetchLocations({cityName: value}).then(data => {
                setLocations(data)
            })    
        }
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

    const {current, location} = weather;

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async() => {
        fetchWeatherForecast({
            cityName: "Istanbul",
            days: "7"
        }).then(data => {
            setWeather(data);
            setLoading(false)
        })
    }
    
    return (
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('../assets/images/bg.png')}
                    blurRadius={70}
                />

            {
                loading? (

                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Progress.CircleSnail thickness={10} size={80} color="#0bb3b2"></Progress.CircleSnail>
                        <Text style={{ color: "white", fontSize: 18 }}>Loading...</Text>
                    </View>
                    
                ): (
                    <View style={styles.container}>
                        <StatusBar style="light" />

        
                        <View style={styles.searchBar}>
                                <View style={[styles.inputWrapper , {backgroundColor: showSearch? "black" : 'transparent', borderRadius: showSearch? 25: 15} ]}>
                                {
                                    showSearch? (
                                        <TextInput
                                        style={[styles.input , { opacity: 0.5 }]}
                                        onChangeText={handleTextDebounce}
                                        placeholder="Search city"
                                        placeholderTextColor={"white"}
                                    />
                
                                    ): (
                                        <View style={styles.placeholder}></View>
                                    )
                                }
                                <View style={[styles.iconView , { opacity: 0.5 }]}>
                                <TouchableOpacity 
                                style={styles.iconWrapper}
                                onPress={() => toggleSearch(!showSearch)}
                                >
                                    <MagnifyingGlassIcon size={25} color={"white"} />
                                </TouchableOpacity>
                                </View>
            
                                {
                                    locations.length > 0 && showSearch? (
                                        <View style={{ position: "absolute", top: 55, backgroundColor: "white", borderRadius: 25, width: "105%", padding: 15 }}>
                                            {
                                                locations.map((loc, index) => {
                                                    return(
                                                        <TouchableOpacity
                                                            onPress={() => handleLocation(loc)}
                                                            key={index}
                                                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 1, padding: 3, paddingVertical: 15 }}
                                                        >
                                                            <MapPinIcon size={25} color="black" paddingHorizontal={5}></MapPinIcon>
                                                            <Text style={{ color: "black", paddingLeft: 10, fontSize: 16}}>{loc?.name}, {loc.country}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    ) : null
                                }
                            </View>
                        </View>
        
        
                        <View style={styles.locationContainer}>
                            <View style={styles.locationView}>
                                <View style={styles.locationTextView}>
                                    <Text style={styles.cityText}>{location?.name},</Text>
                                    <Text style={{ color: "white", opacity: 0.5, fontSize: 20, fontWeight: "bold", paddingTop: 5 }}> {location?.country}</Text>
                                </View>
            
                                <Image 
                                style={styles.locationImage}
                                source={weatherImages[current?.condition?.text]}>
                                </Image>
            
                                <View style={styles.tempView}>
                                    <Text style={styles.tempText}>{current?.temp_c}°C</Text>
                                    <Text style={styles.infoText}>{current?.condition?.text}</Text>
                                </View>
            
                                <View style={styles.detailedInfoView}>
                                    <View style={styles.detailedImageView}>
                                        <Image style={styles.infoImage} source={require("../assets/icons/wind.png")}>
                                        </Image>
                                        <Text style={{ color: "white", paddingLeft: 10, fontWeight: "bold", fontSize: 18 }}>{current?.wind_kph} km</Text>
                                    </View>
            
                                    <View style={styles.detailedImageView}>
                                        <Image style={styles.infoImage} source={require("../assets/icons/drop.png")}>
                                        </Image>
                                        <Text style={{ color: "white", paddingLeft: 10, fontWeight: "bold", fontSize: 18 }}>{current?.humidity}%</Text>
                                    </View>
            
                                    <View style={styles.detailedImageView}>
                                        <Image style={styles.infoImage} source={require("../assets/icons/sun.png")}>
                                        </Image>
                                        <Text style={{ color: "white", paddingLeft: 10, fontWeight: "bold", fontSize: 18 }}>{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
        
                        <View style={styles.dayInfoView}>
                            <View style={styles.iconAndTextView}>
                                <CalendarDaysIcon size={22} color="white"></CalendarDaysIcon>
                                <Text style={{ color: "white", paddingLeft: 10 }}>Daily forecast</Text>
                            </View>
            
                            <View style={styles.daysInfo}>
                                <ScrollView 
                                horizontal
                                contentContainerStyle={styles.scrollView}
                                showsHorizontalScrollIndicator={false}
                                >
                                    {
                                        weather?.forecast?.forecastday?.map((item, index) => {
                                            
                                            let date = new Date(item.date);
                                            let options = { weekday: 'long' };
                                            let dayName = date.toLocaleDateString('en-US', options);
                                            dayName = dayName.split(",")[0]
                                        
                                            return (
                                                <View 
                                                    style={styles.dayContainer}
                                                    key={index}
                                                >
                                                    <Image 
                                                        style={styles.dayImage} 
                                                        source={weatherImages[item?.day?.condition?.text]} 
                                                    />
                                                    <Text style={styles.dayText}>{dayName}</Text>
                                                    <Text style={{ color: "white", paddingTop: 3, fontWeight: "bold", textAlign: "center" }}>
                                                        {item?.day?.avgtemp_c}°C
                                                    </Text>
                                                </View>
                                            );
                                        })
                                        
                                    }
            
                                </ScrollView>
                            </View>
                        </View>
                    </View>

        
                )

            }

            
            </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "f5f5f5",
    },
    bg: {
        position: "absolute",
        height: "100%",
        width: "100%",
    },
    searchBar: {
        height: 70,
        flexDirection: "row",
        paddingTop: 20,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "black",
        borderRadius: 25,
        paddingLeft: 15,
        width: "80%", 
        height: 50,
        zIndex: 2
    },
    placeholder: {
        flex: 1
    },
    input: {
        flex: 1, 
        color: "white",
        fontSize: 16,
        paddingVertical: 15,
    },
    iconWrapper: {
        padding: 10, 
        backgroundColor: "white",
        borderRadius: 25,
        marginLeft: 20,
        opacity: 0.7,
        justifyContent: "center",
        alignItems: "center",
    },
    iconView: {
        paddingRight: 3
    },
    scrollView: { 
        flexGrow: 1,
        justifyContent: "center", 
        alignItems: "center",
    },
    locationContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 520
    },
    locationView: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        height: 100,
    },
    locationTextView: {
        flexDirection: "row"
    },
    cityText: {
        color: "white",
        fontSize: 25,
        textAlign: "center",
        fontWeight: "bold",
    },
    locationImage: {
        width: 200,
        height: 200,
        marginTop: 50,
    },
    tempText: {
        color: "white",
        fontSize: 60,
        fontWeight: "bold",
        paddingTop: 20,
        textAlign: "center"
    },
    infoText: {
        color: "white",
        textAlign: "center",
        letterSpacing: 3,
    },
    detailedImageView: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20
    },
    detailedInfoView: {
        paddingTop: 40,
        flexDirection: "row"
    },
    infoImage: {
        width: 30,
        height: 30,
    },
    iconAndTextView: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 20,
    },
    dayContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        width: 100,
        borderRadius: 15,
        marginLeft: 12,
        marginTop: 20,
        paddingVertical: 18,
    },
    dayImage: {
        width: 50,
        height: 50,
    },
    dayText: {
        color: "white", 
        paddingTop: 3, 
        textAlign: "center"
    },
    dayInfoView: {
        height: 150
    }
});
