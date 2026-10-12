/* =========================================================
   ROOM FINDER
   SERVER STORAGE
   ========================================================= */

const API_URL = "/api/updates";


/* =========================================================
   LOAD ALL UPDATES
   ========================================================= */

async function loadRoomUpdates() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        const updates = {};

        if (
            data.success &&
            Array.isArray(data.updates)
        ) {

            data.updates.forEach(update => {

                const key = createUpdateKey(
                    Number(update.day),
                    Number(update.period),
                    update.room
                );

                updates[key] = {

                    type: update.update_type,

                    who:
                        update.person ||
                        "Teacher",

                    timestamp:
                        update.created_at

                };

            });

        }

        return updates;

    } catch (error) {

        console.error(
            "LOAD ROOM UPDATES ERROR:",
            error
        );

        return {};

    }

}


/* =========================================================
   SAVE ROOM UPDATE
   ========================================================= */

async function saveRoomUpdate(
    room,
    day,
    period,
    update
) {

    console.log(
        "Saving room update:",
        room,
        day,
        period,
        update
    );

    try {

        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    room: room,

                    day: Number(day),

                    period: Number(period),

                    update_type:
                        update.type,

                    person:
                        update.who ||
                        "Teacher"

                })

            }
        );


        const data =
            await response.json();


        console.log(
            "Save response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }


        return true;

    } catch (error) {

        console.error(
            "SAVE ROOM UPDATE ERROR:",
            error
        );

        alert(
            "Could not save the room update.\n\n" +
            error.message
        );

        return false;

    }

}


/* =========================================================
   DELETE ROOM UPDATE
   ========================================================= */

async function deleteRoomUpdate(
    room,
    day,
    period
) {

    console.log(
        "Deleting room update:",
        room,
        day,
        period
    );

    try {

        const response = await fetch(
            API_URL,
            {

                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    room: room,

                    day: Number(day),

                    period: Number(period)

                })

            }
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                `Server returned ${response.status}`
            );

        }


        return true;

    } catch (error) {

        console.error(
            "DELETE ROOM UPDATE ERROR:",
            error
        );

        alert(
            "Could not remove the room update.\n\n" +
            error.message
        );

        return false;

    }

}


/* =========================================================
   UPDATE KEY
   ========================================================= */

function createUpdateKey(
    day,
    period,
    room
) {

    return `${day}|${period}|${room}`;

}