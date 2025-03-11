import React, { useState } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Payment from '../../../Components/screens/FeePayment/Payment';
import History from '../../../Components/screens/FeePayment/History';

const FeePayment = () => {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'payment', title: 'Payment' },
        { key: 'history', title: 'History' },
    ]);

    const renderScene = SceneMap({
        payment: Payment,
        history: History,
    });

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
                <TabBar
                    {...props}
                    style={styles.tabBar}
                    labelStyle={styles.label} // Fixes the text color issue
                    indicatorStyle={styles.indicator} // Makes the active tab indicator more visible
                    activeColor="#000" // Color for active tab
                    inactiveColor="#888" // Color for inactive tabs
                />
            )}
        />
    );
};

export default FeePayment;

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff', // White background for tab bar
        shadowColor: '#000', // Adds a slight shadow effect
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        color: '#000', // Ensures text is visible
        fontSize: 16,
        fontWeight: 'bold',
    },
    indicator: {
        backgroundColor: '#000', // Makes the active tab indicator clearly visible
        height: 3, // Increases indicator thickness
        borderRadius: 2,
    },
});
