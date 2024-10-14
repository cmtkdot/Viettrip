document.addEventListener('DOMContentLoaded', function() {
    // Format dates and times
    const dateElements = document.querySelectorAll('.card-subtitle');
    dateElements.forEach(element => {
        const dateTimeString = element.textContent.trim();
        const [date, time] = dateTimeString.split(' at ');
        const formattedDate = moment(date).format('MMMM D, YYYY');
        const formattedTime = moment(time, 'HH:mm').format('h:mm A');
        element.textContent = `${formattedDate} at ${formattedTime}`;
    });

    // Sort activities by date and time
    const itinerary = document.getElementById('itinerary');
    if (itinerary) {
        const activities = Array.from(itinerary.children);
        activities.sort((a, b) => {
            const dateA = moment(a.querySelector('.card-subtitle').textContent, 'MMMM D, YYYY at h:mm A');
            const dateB = moment(b.querySelector('.card-subtitle').textContent, 'MMMM D, YYYY at h:mm A');
            return dateA - dateB;
        });
        activities.forEach(activity => itinerary.appendChild(activity));
    }
});
