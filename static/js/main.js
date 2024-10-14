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

    // Weekly view functionality
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const weekRangeElement = document.getElementById('weekRange');

    if (prevWeekBtn && nextWeekBtn && weekRangeElement) {
        let currentWeekStart = moment(weekRangeElement.textContent.split(' - ')[0], 'MMMM D, YYYY');

        function updateWeekView(startDate) {
            const endDate = moment(startDate).add(6, 'days');
            weekRangeElement.textContent = `${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`;
            
            // Here you would typically fetch new data for the week and update the calendar
            // For this example, we'll just update the dates in the existing cards
            const dayCards = document.querySelectorAll('.weekly-calendar .card-header');
            dayCards.forEach((card, index) => {
                const day = moment(startDate).add(index, 'days');
                card.innerHTML = `${day.format('dddd')}<br>${day.format('MMMM D')}`;
            });
        }

        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.subtract(7, 'days');
            updateWeekView(currentWeekStart);
        });

        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.add(7, 'days');
            updateWeekView(currentWeekStart);
        });
    }

    // Activity details modal
    const activityItems = document.querySelectorAll('.activity-item');
    const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
    const activityModalBody = document.getElementById('activityModalBody');

    activityItems.forEach(item => {
        item.addEventListener('click', () => {
            const activityId = item.getAttribute('data-activity-id');
            // Fetch activity details from the server
            fetch(`/activities/${activityId}`)
                .then(response => response.json())
                .then(activity => {
                    activityModalBody.innerHTML = `
                        <h5>${activity.title}</h5>
                        <p><strong>Date:</strong> ${moment(activity.date).format('MMMM D, YYYY')}</p>
                        <p><strong>Time:</strong> ${moment(activity.start_time, 'HH:mm:ss').format('h:mm A')} - ${moment(activity.end_time, 'HH:mm:ss').format('h:mm A')}</p>
                        <p><strong>Location:</strong> ${activity.location}</p>
                        <p><strong>Category:</strong> ${activity.category}</p>
                        <p><strong>Price:</strong> $${activity.price.toFixed(2)}</p>
                        <p><strong>Description:</strong> ${activity.description}</p>
                    `;
                    activityModal.show();
                })
                .catch(error => console.error('Error fetching activity details:', error));
        });
    });
});
