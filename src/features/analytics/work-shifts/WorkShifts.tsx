import { useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import useAuth from "../../auth/useAuth.hook"
import { ShiftResponse, ShiftStatus, shiftService } from "../../dashboard/services/shiftService";

export default function WorkShifts() {

    const { branchId } = useAuth();
    const [shifts, setShifts] = useState<ShiftResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchShifts = async (isRefresh = false) => {
        if (!branchId) return;
        
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            const fetchedShifts = await shiftService.getBranchShifts(branchId);
            setShifts(fetchedShifts);
        } catch (err) {
            console.error('Error fetching shifts:', err);
            setError('Failed to load shifts. Please try again.');
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    const handleRefresh = () => {
        fetchShifts(true);
    };

    useEffect(() => {
        if (branchId) {
            fetchShifts();
        }
    }, [branchId]);

    const getStatusIcon = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.Started:
                return 'mdi:play-circle';
            case ShiftStatus.Ended:
                return 'mdi:stop-circle';
            default:
                return 'mdi:circle-outline';
        }
    };

    const getStatusColor = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.Started:
                return '#22c55e'; // Green
            case ShiftStatus.Ended:
                return '#ef4444'; // Red
            default:
                return '#6b7280'; // Gray
        }
    };

    const getStatusText = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.Started:
                return 'Active';
            case ShiftStatus.Ended:
                return 'Ended';
            default:
                return 'Not Started';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateShiftDuration = (start: string, end?: string) => {
        const startTime = new Date(start);
        const endTime = end ? new Date(end) : new Date();
        const duration = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Icon icon="mdi:loading" className="animate-spin" style={{ fontSize: '2rem', color: '#482bb0' }} />
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading shifts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Icon icon="mdi:alert-circle" style={{ fontSize: '2rem', color: '#ef4444' }} />
                <p style={{ marginTop: '1rem', color: '#ef4444' }}>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#482bb0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <div>
                    <h1 style={{ 
                        fontSize: '2rem', 
                        color: '#3b2d68', 
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <Icon icon="mdi:clock-time-eight-outline" style={{ color: '#482bb0' }} />
                        Work Shifts
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                        View and manage branch work shifts history
                    </p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: refreshing ? '#e5e7eb' : '#482bb0',
                        color: refreshing ? '#6b7280' : 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: refreshing ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                >
                    <Icon 
                        icon={refreshing ? "mdi:loading" : "mdi:refresh"} 
                        style={{ 
                            fontSize: '1rem',
                            animation: refreshing ? 'spin 1s linear infinite' : 'none'
                        }}
                    />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {shifts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2dbfc'
                }}>
                    <Icon icon="mdi:calendar-blank" style={{ fontSize: '3rem', color: '#9ca3af' }} />
                    <h3 style={{ color: '#6b7280', marginTop: '1rem' }}>No shifts found</h3>
                    <p style={{ color: '#9ca3af' }}>No work shifts have been recorded yet.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
                }}>
                    {shifts.map((shift) => (
                        <div
                            key={shift.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #e2dbfc',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            {/* Header with status */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '600',
                                    color: getStatusColor(shift.status)
                                }}>
                                    <Icon icon={getStatusIcon(shift.status)} />
                                    {getStatusText(shift.status)}
                                </span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    fontWeight: '500'
                                }}>
                                    {formatDate(shift.shiftStartTime)}
                                </span>
                            </div>

                            {/* Shift details */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#374151'
                                    }}>
                                        <Icon icon="mdi:clock-start" style={{ color: '#22c55e' }} />
                                        <strong>Started:</strong> {formatTime(shift.shiftStartTime)}
                                    </span>
                                </div>
                                {shift.shiftEndTime ? (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#374151'
                                        }}>
                                            <Icon icon="mdi:clock-end" style={{ color: '#ef4444' }} />
                                            <strong>Ended:</strong> {formatTime(shift.shiftEndTime)}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#f59e0b'
                                        }}>
                                            <Icon icon="mdi:clock-outline" />
                                            <strong>Currently running...</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Duration */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#374151',
                                    fontWeight: '500'
                                }}>
                                    <Icon icon="mdi:timer-outline" style={{ color: '#482bb0' }} />
                                    Duration: {calculateShiftDuration(shift.shiftStartTime, shift.shiftEndTime)}
                                </span>
                            </div>

                            {/* Shift ID */}
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #e2e8f0',
                                fontSize: '0.75rem',
                                color: '#9ca3af'
                            }}>
                                ID: {shift.id}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </>
    );

}