import React from 'react';
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment'

momentLocalizer(moment);

export default class DateInput extends React.Component {

    render() {
        const format="DD MMMM YYYY";
         return <DateTimePicker
            {...this.props}
            time={false}
            value={this.props.value ? new Date(this.props.value): null }
            onChange={(date, string) => this.props.onChange(string)}
            parse={(string) => {
                const valid = moment(string, format).isValid()
                return valid ? moment(string, format) : null}
            }
            format={format} />
    }
}