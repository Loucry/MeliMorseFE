import React from 'react';

class MorseService extends React.Component {

    static url = "http://ec2-18-218-254-247.us-east-2.compute.amazonaws.com:8080/translate";

    static translateBinary = async (binary, stats) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: binary, spaceStats: !!stats ? stats : null })
        };
        const response = await fetch(this.url + '/binary', requestOptions)
            .then(response => response.json());
        return response;
    }

}

export default MorseService;