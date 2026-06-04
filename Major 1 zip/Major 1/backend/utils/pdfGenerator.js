const PDFDocument = require('pdfkit');

function generateTimetablePDF(timetable, res) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 30 });
            
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=timetable_${timetable.department?.name || 'unknown'}_${timetable.year}.pdf`);
            
            doc.pipe(res);
            
            // Title
            const deptName = timetable.department?.name || 'Unknown Department';
            const year = timetable.year || 'Unknown Year';
            
            doc.fontSize(18).text(`${deptName} - ${year} Timetable`, { align: 'center' });
            doc.moveDown(0.5);
            
            // Days of the week
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            
            // Get time slots from timetable or use default
            let timeSlots = timetable.timeSlots || [
                { time: '09:00 - 10:00' },
                { time: '10:00 - 11:00' },
                { time: '11:00 - 12:00' },
                { time: '12:00 - 01:00' },
                { time: '01:00 - 02:00' },
                { time: '02:00 - 03:00' },
                { time: '03:00 - 04:00' },
                { time: '04:00 - 05:00' }
            ];
            
            // Calculate column widths
            const totalWidth = doc.page.width - 60; // margins
            const timeColWidth = 70;
            const dayColWidth = (totalWidth - timeColWidth) / days.length;
            
            // Table header
            const startX = 30;
            const startY = doc.y + 10;
            const rowHeight = 30;
            
            // Draw header row
            doc.fontSize(9).font('Helvetica-Bold');
            doc.rect(startX, startY, timeColWidth, rowHeight).fill('#E0E0E0').stroke();
            doc.fillColor('#000000').text('Time', startX + 2, startY + 10, { width: timeColWidth - 4, align: 'center' });
            
            let headerX = startX + timeColWidth;
            days.forEach((day) => {
                doc.rect(headerX, startY, dayColWidth, rowHeight).fill('#E0E0E0').stroke();
                doc.fillColor('#000000').text(day, headerX + 2, startY + 10, { width: dayColWidth - 4, align: 'center' });
                headerX += dayColWidth;
            });
            
            // Draw time slots
            doc.font('Helvetica').fontSize(8);
            let rowY = startY + rowHeight;
            
            timeSlots.forEach((slot, slotIndex) => {
                const timeStr = slot.time || '';
                
                // Time column
                doc.rect(startX, rowY, timeColWidth, rowHeight).fill('#F5F5F5').stroke();
                doc.fillColor('#000000').text(timeStr, startX + 2, rowY + 10, { width: timeColWidth - 4, align: 'center' });
                
                // Day columns
                let colX = startX + timeColWidth;
                days.forEach(day => {
                    const slotData = timetable.weekData?.[day]?.[slotIndex];
                    
                    let cellContent = '';
                    let bgColor = '#FFFFFF';
                    
                    if (slotData?.isLunch) {
                        cellContent = 'Lunch Break';
                        bgColor = '#FFF3E0';
                    } else if (slotData?.isBreak) {
                        cellContent = slotData.breakType === 'short' ? 'Short Break' : 'Break';
                        bgColor = '#FFFDE7';
                    } else if (slotData?.subjects?.length > 0) {
                        const subject = slotData.subjects[0];
                        cellContent = subject?.name || '';
                        if (slotData.faculty?.name) {
                            cellContent += `\n${slotData.faculty.name}`;
                        }
                        if (slotData.room?.roomNumber) {
                            cellContent += `\n${slotData.room.roomNumber}`;
                        }
                        if (slotData.batch?.name) {
                            cellContent += `\nBatch: ${slotData.batch.name}`;
                        }
                        bgColor = slotData.isLab ? '#E8F5E9' : '#FFFFFF';
                    }
                    
                    doc.rect(colX, rowY, dayColWidth, rowHeight).fill(bgColor).stroke();
                    doc.fillColor('#000000').text(cellContent, colX + 2, rowY + 5, {
                        width: dayColWidth - 4,
                        height: rowHeight - 10,
                        align: 'center'
                    });
                    
                    colX += dayColWidth;
                });
                
                rowY += rowHeight;
                
                // Check if we need a new page
                if (rowY > doc.page.height - 80) {
                    doc.addPage();
                    rowY = 30;
                }
            });
            
            // Add Important Notes if available
            if (timetable.importantNotes && timetable.importantNotes.length > 0) {
                doc.moveDown(2);
                doc.fontSize(10).font('Helvetica-Bold').text('Important Notes:', { underline: false });
                doc.font('Helvetica').fontSize(8);
                
                timetable.importantNotes.forEach((note, index) => {
                    doc.text(`• ${note}`, { indent: 10 });
                });
            }
            
            // Add Faculty Load if available
            if (timetable.facultyLoad && timetable.facultyLoad.length > 0) {
                doc.moveDown(1);
                doc.fontSize(10).font('Helvetica-Bold').text('Faculty Load:', { underline: false });
                doc.font('Helvetica').fontSize(8);
                
                timetable.facultyLoad.forEach((load) => {
                    doc.text(`• ${load.name}: ${load.lecturesPerWeek} lectures`, { indent: 10 });
                });
            }
            
            // Footer
            doc.fontSize(8).text(
                `Generated on: ${new Date().toLocaleString()}`,
                50,
                doc.page.height - 40,
                { align: 'center' }
            );
            
            doc.end();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateTimetablePDF };
