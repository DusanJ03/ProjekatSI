namespace PAPI.Models.DTOs
{
    public class TerapeutDashboardDto
    {
        public TerminDashboardDto? NextSession { get; set; }
        public double ProsecnaOcena { get; set; }
        public List<ReviewDashboardDto> RecentReviews { get; set; }
        public int UpcomingAppointmentsCount { get; set; }
    }
}
