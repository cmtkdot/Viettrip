document.addEventListener('DOMContentLoaded', function() {
    // Format dates and times
    const dateHeaders = document.querySelectorAll('.card-header h2');
    dateHeaders.forEach(element => {
        const date = moment(element.textContent, 'MMMM DD, YYYY');
        element.textContent = date.format('dddd, MMMM D, YYYY');
    });

    const timeRanges = document.querySelectorAll('.card-subtitle');
    timeRanges.forEach(element => {
        const timeRange = element.textContent.trim();
        const [startTime, endTime] = timeRange.split(' - ');
        const formattedStartTime = moment(startTime, 'hh:mm A').format('h:mm A');
        const formattedEndTime = moment(endTime, 'hh:mm A').format('h:mm A');
        element.textContent = `${formattedStartTime} - ${formattedEndTime}`;
    });
});
