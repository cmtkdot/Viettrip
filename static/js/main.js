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
                    <div class="day-header">
                        ${moment(day).format('ddd DD')}
                        <button class="btn btn-sm btn-outline-secondary toggle-day-view">Toggle</button>
                    </div>
                    <div class="day-activities"></div>
                `;

                const dayActivities = dayColumn.querySelector('.day-activities');
                const sortedActivities = activities.sort((a, b) => {
                    return moment(a.start_time, 'HH:mm:ss').diff(moment(b.start_time, 'HH:mm:ss'));
                });

                let lastEndTime = null;
                sortedActivities.forEach((activity, index) => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    activityItem.dataset.activityId = activity.id;

                    const startTime = moment(activity.start_time, 'HH:mm:ss');
                    const endTime = moment(activity.end_time, 'HH:mm:ss');
                    const duration = moment.duration(endTime.diff(startTime));
                    const durationInMinutes = duration.asMinutes();

                    const top = (startTime.hour() * 60 + startTime.minute()) / 1440 * 100;
                    const height = durationInMinutes / 1440 * 100;

                    activityItem.style.top = `${top}%`;
                    activityItem.style.height = `${height}%`;

                    // Handle overlapping activities
                    if (lastEndTime && startTime.isBefore(lastEndTime)) {
                        const overlap = moment.duration(lastEndTime.diff(startTime)).asMinutes();
                        const overlapPercentage = overlap / durationInMinutes * 100;
                        activityItem.style.marginTop = `${overlapPercentage}%`;
                        activityItem.style.height = `${height - overlapPercentage}%`;
                    }

                    activityItem.innerHTML = `
                        <div class="activity-content">
                            <strong>${activity.title}</strong><br>
                            <small>${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}</small>
                        </div>
                        <div class="activity-details">
                            <p><strong>Location:</strong> ${activity.location}</p>
                            <p><strong>Category:</strong> ${activity.category}</p>
                            <p><strong>Price:</strong> $${parseFloat(activity.price).toFixed(2)}</p>
                        </div>
                    `;
                    dayActivities.appendChild(activityItem);

                    lastEndTime = endTime;
                });

                daysContainer.appendChild(dayColumn);
            });

            // Reattach event listeners for activity items and toggle buttons
            attachActivityItemListeners();
            attachToggleDayViewListeners();
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

    function attachToggleDayViewListeners() {
        const toggleButtons = document.querySelectorAll('.toggle-day-view');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const dayColumn = event.target.closest('.day-column');
                dayColumn.classList.toggle('collapsed');
                event.stopPropagation();
            });
        });
    }

    // Initial attachment of activity item listeners and toggle day view listeners
    attachActivityItemListeners();
    attachToggleDayViewListeners();
});
