document.addEventListener('DOMContentLoaded', function() {
    // Weekly view functionality
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const weekRangeElement = document.getElementById('weekRange');
    const categoryFilterForm = document.getElementById('category-filter-form');
    const dateFilterForm = document.getElementById('date-filter-form');
    let selectedCategories = [];
    let startDate = null;
    let endDate = null;

    if (prevWeekBtn && nextWeekBtn && weekRangeElement) {
        let currentWeekStart = moment(weekRangeElement.textContent.split(' - ')[0], 'MMMM D, YYYY');

        function updateWeekView(weekStart) {
            const weekEnd = moment(weekStart).add(6, 'days');
            weekRangeElement.textContent = `${weekStart.format('MMMM D, YYYY')} - ${weekEnd.format('MMMM D, YYYY')}`;
            
            // Fetch new data for the week and update the calendar
            fetch(`/weekly_view_data?start_date=${weekStart.format('YYYY-MM-DD')}&end_date=${weekEnd.format('YYYY-MM-DD')}&categories=${selectedCategories.join(',')}`)
                .then(response => response.json())
                .then(data => {
                    updateWeeklyCalendar(data);
                })
                .catch(error => console.error('Error fetching weekly view data:', error));
        }

        function updateWeeklyCalendar(data) {
            const timeRows = document.querySelector('.time-rows');
            timeRows.innerHTML = '';

            for (let hour = 0; hour < 24; hour++) {
                const timeRow = document.createElement('div');
                timeRow.className = 'time-row';
                timeRow.innerHTML = `
                    <div class="time-label">${hour.toString().padStart(2, '0')}:00</div>
                `;

                Object.entries(data).forEach(([day, activities]) => {
                    const dayCell = document.createElement('div');
                    dayCell.className = 'day-cell';
                    dayCell.dataset.day = day;
                    dayCell.dataset.hour = hour;

                    const relevantActivities = activities.filter(activity => {
                        const startHour = moment(activity.start_time, 'HH:mm:ss').hour();
                        const endHour = moment(activity.end_time, 'HH:mm:ss').hour();
                        return startHour <= hour && endHour > hour && selectedCategories.includes(activity.category);
                    });

                    relevantActivities.forEach(activity => {
                        const activityItem = createActivityItem(activity, hour);
                        dayCell.appendChild(activityItem);
                    });

                    timeRow.appendChild(dayCell);
                });

                timeRows.appendChild(timeRow);
            }

            // Reattach event listeners for activity items and toggle buttons
            attachActivityItemListeners();
            attachToggleDayViewListeners();
        }

        function createActivityItem(activity, currentHour) {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.dataset.activityId = activity.id;
            activityItem.dataset.category = activity.category;

            const startTime = moment(activity.start_time, 'HH:mm:ss');
            const endTime = moment(activity.end_time, 'HH:mm:ss');
            const startHour = startTime.hour();
            const endHour = endTime.hour();

            if (startHour === currentHour) {
                const topOffset = (startTime.minute() / 60) * 100;
                activityItem.style.top = `${topOffset}%`;
            } else {
                activityItem.style.top = '0%';
            }

            const durationInHours = moment.duration(endTime.diff(startTime)).asHours();
            const height = Math.min(durationInHours, endHour - currentHour) * 100;
            activityItem.style.height = `${height}%`;

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

            return activityItem;
        }

        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.subtract(7, 'days');
            updateWeekView(currentWeekStart);
        });

        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.add(7, 'days');
            updateWeekView(currentWeekStart);
        });

        // Handle category filter form submission
        categoryFilterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            selectedCategories = Array.from(document.querySelectorAll('#category-filter-form input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
            updateWeekView(currentWeekStart);
        });

        // Handle date filter form submission
        dateFilterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;
            if (startDate && endDate) {
                currentWeekStart = moment(startDate);
                updateWeekView(currentWeekStart);
            }
        });

        // Initialize selected categories
        selectedCategories = Array.from(document.querySelectorAll('#category-filter-form input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
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
                const dayColumn = event.target.closest('.day-header');
                const dayIndex = Array.from(dayColumn.parentNode.children).indexOf(dayColumn);
                const dayCells = document.querySelectorAll(`.day-cell:nth-child(${dayIndex + 1})`);
                dayCells.forEach(cell => cell.classList.toggle('collapsed'));
                event.stopPropagation();
            });
        });
    }

    // Initial attachment of activity item listeners and toggle day view listeners
    attachActivityItemListeners();
    attachToggleDayViewListeners();
});
