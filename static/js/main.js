document.addEventListener('DOMContentLoaded', function() {
    // Weekly view functionality
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const weekRangeElement = document.getElementById('weekRange');

    if (prevWeekBtn && nextWeekBtn && weekRangeElement) {
        let currentWeekStart = moment(weekRangeElement.textContent.split(' - ')[0], 'MMMM D, YYYY');

        function updateWeekView(startDate) {
            const endDate = moment(startDate).add(6, 'days');
            weekRangeElement.textContent = `${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`;
            
            // Fetch new data for the week and update the calendar
            fetch(`/weekly_view_data?start_date=${startDate.format('YYYY-MM-DD')}`)
                .then(response => response.json())
                .then(data => {
                    updateWeeklyCalendar(data);
                })
                .catch(error => console.error('Error fetching weekly view data:', error));
        }

        function updateWeeklyCalendar(data) {
            const daysContainer = document.querySelector('.days-container');
            daysContainer.innerHTML = '';

            Object.entries(data).forEach(([day, activities]) => {
                const dayColumn = document.createElement('div');
                dayColumn.className = 'day-column';
                dayColumn.innerHTML = `
                    <div class="day-header">${moment(day).format('dddd')}<br>${moment(day).format('MMMM D')}</div>
                    <div class="day-activities"></div>
                `;

                const dayActivities = dayColumn.querySelector('.day-activities');
                activities.forEach(activity => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    activityItem.dataset.activityId = activity.id;
                    activityItem.style.top = `${((activity.start_time.hour * 60 + activity.start_time.minute) / 1440) * 100}%`;
                    activityItem.style.height = `${((activity.end_time.hour * 60 + activity.end_time.minute) - (activity.start_time.hour * 60 + activity.start_time.minute)) / 1440 * 100}%`;
                    activityItem.innerHTML = `
                        <strong>${activity.title}</strong><br>
                        ${moment(activity.start_time, 'HH:mm:ss').format('h:mm A')} - ${moment(activity.end_time, 'HH:mm:ss').format('h:mm A')}<br>
                        <small>${activity.category} - $${parseFloat(activity.price).toFixed(2)}</small>
                    `;
                    dayActivities.appendChild(activityItem);
                });

                daysContainer.appendChild(dayColumn);
            });

            // Reattach event listeners for activity items
            attachActivityItemListeners();
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
    const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
    const activityModalBody = document.getElementById('activityModalBody');

    function attachActivityItemListeners() {
        const activityItems = document.querySelectorAll('.activity-item');
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
                            <p><strong>Price:</strong> $${parseFloat(activity.price).toFixed(2)}</p>
                            <p><strong>Description:</strong> ${activity.description}</p>
                        `;
                        activityModal.show();
                    })
                    .catch(error => console.error('Error fetching activity details:', error));
            });
        });
    }

    // Initial attachment of activity item listeners
    attachActivityItemListeners();
});
